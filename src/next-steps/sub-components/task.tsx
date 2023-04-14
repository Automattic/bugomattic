import React, { ReactNode, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../static-data/reporting-config/reporting-config-slice';
import { TaskLink } from '../../static-data/reporting-config/types';
import { ReactComponent as SlackIcon } from '../../common/svgs/slack-colored.svg';
import { ReactComponent as GithubIcon } from '../../common/svgs/github.svg';
import { ReactComponent as P2Icon } from '../../common/svgs/p2.svg';
import { ReactComponent as LinkIcon } from '../../common/svgs/external-link-blue.svg';
import { selectIssueDetails } from '../../issue-details/issue-details-slice';
import styles from '../next-steps.module.css';
import {
	addCompletedTask,
	removeCompletedTask,
	selectCompletedTasks,
} from '../completed-tasks-slice';
import {
	createGeneralHref,
	createNewGithubIssueHref,
	createP2Href,
	createSlackHref,
} from '../../common/lib';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { updateHistoryWithState } from '../../url-history/actions';
import { useLoggerWithCache } from '../../monitoring/use-logger-with-cache';
import { makeSelectorToPredictCompletingAllTasks } from '../../combined-selectors/all-tasks-are-complete';

interface Props {
	taskId: string;
}

export function Task( { taskId }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const { tasks } = useAppSelector( selectNormalizedReportingConfig );
	const { issueTitle } = useAppSelector( selectIssueDetails );
	const completedTaskIds = useAppSelector( selectCompletedTasks );

	const logError = useLoggerWithCache( monitoringClient.logger.error, [ taskId, tasks ] );

	const isChecked = completedTaskIds.includes( taskId );

	// If possible, we want to tie all Tracks events to actual user actions like clicks.
	// This prevents use from making too many misleading events from browser navigations.
	// This is tricky for calculated state, like all tasks being completed.
	// But, we can accurately predict if a given task completion will complete all tasks.
	// But we also need to be careful and make sure there's a unique memoized selector for each task component.
	// See https://react-redux.js.org/api/hooks#using-memoizing-selectors
	const selectorToPredictCompletingAllTasks = useMemo(
		makeSelectorToPredictCompletingAllTasks,
		[]
	);
	const taskCompletionWillCompleteAll = useAppSelector( ( state ) =>
		selectorToPredictCompletingAllTasks( state, taskId )
	);

	const handleCheckboxChange = () => {
		if ( isChecked ) {
			dispatch( removeCompletedTask( taskId ) );
		} else {
			dispatch( addCompletedTask( taskId ) );
			monitoringClient.analytics.recordEvent( 'task_complete' );

			if ( taskCompletionWillCompleteAll ) {
				monitoringClient.analytics.recordEvent( 'task_complete_all' );
			}
		}
		dispatch( updateHistoryWithState() );
	};

	const { title, details, link } = tasks[ taskId ];

	if ( ! title && ! details && ! link ) {
		// We have nothing to display!
		return null;
	}

	let taskIsBroken = false;
	let titleDisplay: ReactNode;
	let buttonDisplay: ReactNode = null;
	if ( link ) {
		const handleLinkClick = () => {
			monitoringClient.analytics.recordEvent( 'task_link_click', { linkType: link.type } );
			handleCheckboxChange();
		};

		try {
			const titleText = title || getDefaultTitleForLink( link );
			const href = createLinkHref( link, issueTitle );
			titleDisplay = <span className={ styles.taskTitle }>{ titleText }</span>;
			buttonDisplay = (
				<a
					className={ styles.taskLink }
					target="_blank"
					href={ href }
					rel="noreferrer"
					// When they open a link, let's trigger the checkbox change too
					onClick={ handleLinkClick }
				>
					{ getAppIconForLink( link ) }
					<span className={ styles.linkText }>{ getLinkName( link ) }</span>
					<LinkIcon aria-hidden={ true } className={ styles.linkIcon } />
				</a>
			);
		} catch ( err ) {
			const error = err as Error;
			logError( 'Task link has broken configuration', {
				taskId,
				error: error.message,
			} );

			taskIsBroken = true;
			titleDisplay = (
				<span className={ styles.badTask }>
					This task has broken configuration. Please notify the Bugomattic administrators.
				</span>
			);
		}
	} else {
		const titleText = title ? title : 'Complete the details below';
		titleDisplay = <span className={ styles.taskTitle }>{ titleText }</span>;
	}

	let detailsDisplay: ReactNode = null;
	if ( ! taskIsBroken && details ) {
		detailsDisplay = <p className={ styles.taskDetails }>{ details }</p>;
	}

	return (
		<li className={ styles.taskListItem }>
			<label className={ styles.task }>
				<input
					className={ styles.taskCheckbox }
					onChange={ handleCheckboxChange }
					checked={ isChecked }
					type="checkbox"
				/>
				<div>
					{ titleDisplay }
					{ detailsDisplay }
				</div>
			</label>
			{ buttonDisplay && <div className={ styles.buttonContent }>{ buttonDisplay }</div> }
		</li>
	);
}

function getDefaultTitleForLink( link: TaskLink ): string {
	switch ( link.type ) {
		case 'general':
			return link.href;
		case 'github':
			return `Open an issue in the ${ link.repository } repo`;
		case 'slack':
			return `Notify the #${ link.channel } channel in Slack`;
		case 'p2':
			return `Post on the +${ link.subdomain } P2`;
	}
}

function getAppIconForLink( link: TaskLink ): ReactNode {
	switch ( link.type ) {
		case 'general':
			return null;
		case 'github':
			return (
				<GithubIcon data-testid="github-icon" aria-hidden={ true } className={ styles.appIcon } />
			);
		case 'slack':
			return (
				<SlackIcon data-testid="slack-icon" aria-hidden={ true } className={ styles.appIcon } />
			);
		case 'p2':
			return <P2Icon data-testid="p2-icon" aria-hidden={ true } className={ styles.appIcon } />;
	}
}

function getLinkName( link: TaskLink ): string {
	switch ( link.type ) {
		case 'general':
			return 'General';
		case 'github':
			return 'GitHub';
		case 'slack':
			return 'Slack';
		case 'p2':
			return 'P2';
	}
}

function createLinkHref( link: TaskLink, issueTitle?: string ): string {
	switch ( link.type ) {
		case 'general':
			return createGeneralHref( link );
		case 'github':
			return createNewGithubIssueHref( link, issueTitle );
		case 'slack':
			return createSlackHref( link );
		case 'p2':
			return createP2Href( link );
	}
}
