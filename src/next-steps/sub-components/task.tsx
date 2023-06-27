import React, { ReactNode, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../static-data/reporting-config/reporting-config-slice';
import { TaskLink } from '../../static-data/reporting-config/types';
import { ReactComponent as SlackIcon } from '../../common/svgs/slack-colored.svg';
import { ReactComponent as GithubIcon } from '../../common/svgs/github.svg';
import { ReactComponent as P2Icon } from '../../common/svgs/p2.svg';
import { ReactComponent as LinkIcon } from '../../common/svgs/external-link.svg';
import { ReactComponent as JiraIcon } from '../../common/svgs/jira.svg';
import { ReactComponent as GeneralIcon } from '../../common/svgs/info.svg';
import { ReactComponent as CheckIcon } from '../../common/svgs/check.svg';
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
	createNewJiraIssueHref,
	createP2Href,
	createSlackHref,
	replaceSpaces,
} from '../../common/lib';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { updateHistoryWithState } from '../../url-history/actions';
import { useLoggerWithCache } from '../../monitoring/use-logger-with-cache';
import { makeSelectorToPredictCompletingAllTasks } from '../../combined-selectors/all-tasks-are-complete';
import { OutlineNeutralButton } from '../../common/components';

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

	const isComplete = completedTaskIds.includes( taskId );

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

	const completeTask = () => {
		dispatch( addCompletedTask( taskId ) );
		dispatch( updateHistoryWithState() );
		monitoringClient.analytics.recordEvent( 'task_complete' );

		if ( taskCompletionWillCompleteAll ) {
			monitoringClient.analytics.recordEvent( 'task_complete_all' );
		}
	};

	const uncompleteTask = () => {
		dispatch( removeCompletedTask( taskId ) );
		dispatch( updateHistoryWithState() );
	};

	const { title, details, link } = tasks[ taskId ];

	if ( ! title && ! details && ! link ) {
		// We have nothing to display!
		return null;
	}

	const titleText = title || getDefaultTitleForLink( link );
	const titleId = replaceSpaces( `title-${ taskId }` );
	const detailsText = details || getDefaultDetailsForLink( link );
	const detailsId = replaceSpaces( `details-${ taskId }` );

	const markAsCompleteButton = (
		<OutlineNeutralButton className={ styles.taskButton } onClick={ completeTask }>
			Mark as complete
		</OutlineNeutralButton>
	);
	const unmarkAsCompleteButton = (
		<OutlineNeutralButton className={ styles.taskButton } onClick={ uncompleteTask }>
			Unmark as complete
		</OutlineNeutralButton>
	);

	const cardDisplay = (
		<div className={ styles.taskCard } data-completed-task={ isComplete ? 'true' : 'false' }>
			<div className={ styles.taskIconWrapper }>
				{ isComplete ? (
					<CheckIcon data-testid="check-icon" aria-hidden={ true } className={ styles.checkIcon } />
				) : (
					getTaskIconForLink( link )
				) }
			</div>
			<div className={ styles.taskContent }>
				<span id={ titleId } className={ styles.taskTitle }>
					{ titleText }
				</span>
				{ detailsText && (
					<p id={ detailsId } className={ styles.taskDetails }>
						{ detailsText }
					</p>
				) }
			</div>
			{ link && <LinkIcon className={ styles.linkIcon } /> }
			{ isComplete ? unmarkAsCompleteButton : markAsCompleteButton }
		</div>
	);

	const handleLinkClick = () => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		monitoringClient.analytics.recordEvent( 'task_link_click', { linkType: link!.type } );
		if ( ! isComplete ) {
			completeTask();
			dispatch( updateHistoryWithState() );
		}
	};

	const wrappedCardDisplay = link ? (
		<a
			className={ styles.taskLink }
			target="_blank"
			href={ createLinkHref( link, issueTitle ) }
			rel="noreferrer"
			aria-labelledby={ titleId }
			aria-describedby={ detailsId }
			// When they open a link, let's trigger the checkbox change too
			onClick={ handleLinkClick }
		>
			{ cardDisplay }
		</a>
	) : (
		cardDisplay
	);

	return <li className={ styles.taskListItem }>{ wrappedCardDisplay }</li>;
}

function getDefaultTitleForLink( link: TaskLink | undefined ): string {
	if ( ! link ) {
		return 'Complete the details below';
	}

	switch ( link.type ) {
		case 'general':
			return 'Click the link to report your issue';
		case 'github':
			return `Click the link to open your report in the ${ link.repository } repo`;
		case `jira`:
			return 'Click the link to open a new Jira issue';
		case 'slack':
			return `Notify the #${ link.channel } channel in Slack`;
		case 'p2':
			return `Post on the +${ link.subdomain } P2`;
	}
}

function getDefaultDetailsForLink( link: TaskLink | undefined ): string | null {
	if ( ! link ) {
		return null;
	}

	switch ( link.type ) {
		case 'general':
			return null;
		case 'github':
			return `Don't forget to click "Submit new issue" on the GitHub form when you're done!`;
		case `jira`:
			return null;
		case 'slack':
			return null;
		case 'p2':
			return null;
	}
}

function getTaskIconForLink( link: TaskLink | undefined ): ReactNode {
	if ( ! link ) {
		return (
			<GeneralIcon data-testid="general-icon" aria-hidden={ true } className={ styles.taskIcon } />
		);
	}

	switch ( link.type ) {
		case 'general':
			return (
				<GeneralIcon
					data-testid="general-icon"
					aria-hidden={ true }
					className={ styles.taskIcon }
				/>
			);
		case 'github':
			return (
				<GithubIcon data-testid="github-icon" aria-hidden={ true } className={ styles.taskIcon } />
			);
		case 'jira':
			return (
				<JiraIcon data-testid="jira-icon" aria-hidden={ true } className={ styles.taskIcon } />
			);
		case 'slack':
			return (
				<SlackIcon data-testid="slack-icon" aria-hidden={ true } className={ styles.taskIcon } />
			);
		case 'p2':
			return <P2Icon data-testid="p2-icon" aria-hidden={ true } className={ styles.taskIcon } />;
	}
}

function createLinkHref( link: TaskLink, issueTitle?: string ): string {
	switch ( link.type ) {
		case 'general':
			return createGeneralHref( link );
		case 'github':
			return createNewGithubIssueHref( link, issueTitle );
		case 'jira':
			return createNewJiraIssueHref( link );
		case 'slack':
			return createSlackHref( link );
		case 'p2':
			return createP2Href( link );
	}
}
