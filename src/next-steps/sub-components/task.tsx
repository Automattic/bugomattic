import React, { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../reporting-config/reporting-config-slice';
import { TaskLink } from '../../reporting-config/types';
import urlJoin from 'url-join';
import { ReactComponent as SlackIcon } from '../../common/svgs/slack.svg';
import { ReactComponent as GithubIcon } from '../../common/svgs/github.svg';
import { ReactComponent as P2Icon } from '../../common/svgs/p2.svg';
import { ReactComponent as LinkIcon } from '../../common/svgs/external-link.svg';
import { selectIssueDetails } from '../../issue-details/issue-details-slice';
import styles from '../next-steps.module.css';
import {
	addCompletedTask,
	removeCompletedTask,
	selectCompletedTasks,
} from '../completed-tasks-slice';

interface Props {
	taskId: string;
}

export function Task( { taskId }: Props ) {
	const dispatch = useAppDispatch();
	const { tasks } = useAppSelector( selectNormalizedReportingConfig );
	const { issueTitle } = useAppSelector( selectIssueDetails );
	const completedTaskIds = useAppSelector( selectCompletedTasks );

	const isChecked = completedTaskIds.includes( taskId );

	const handleCheckboxChange = () => {
		if ( isChecked ) {
			dispatch( removeCompletedTask( taskId ) );
		} else {
			dispatch( addCompletedTask( taskId ) );
		}
	};

	const { title, details, link } = tasks[ taskId ];

	let titleDisplay: ReactNode;
	if ( link ) {
		const linkText = title || getDefaultTextForLinkType( link );
		titleDisplay = (
			<a
				className={ styles.taskTitle }
				target="_blank"
				href={ createLinkHref( link, issueTitle ) }
				rel="noreferrer"
				// When they open a link, let's trigger the checkbox change too
				onClick={ handleCheckboxChange }
			>
				{ getAppIcon( link ) }
				<span>{ linkText }</span>
				<LinkIcon className={ styles.linkIcon } />
			</a>
		);
	} else {
		const titleText = title ? title : 'Complete the details below';
		titleDisplay = <span className={ styles.taskTitle }>{ titleText }</span>;
	}

	let detailsDisplay: ReactNode = null;
	if ( details ) {
		detailsDisplay = <p className={ styles.taskDetails }>{ details }</p>;
	}

	return (
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
	);
}

function getDefaultTextForLinkType( link: TaskLink ): string {
	switch ( link.type ) {
		case 'general':
			return link.href;
		case 'github':
			return 'Open an issue in GitHub';
		case 'slack':
			return `Notify the #${ link.channel } channel in Slack`;
		case 'p2':
			return `Post on the +${ link.subdomain } P2`;
	}
}

function createLinkHref( link: TaskLink, issueTitle?: string ): string {
	switch ( link.type ) {
		case 'general':
			return new URL( link.href ).href;
		case 'github': {
			const url = new URL( 'https://github.com' );
			let pathEnd = 'new';
			if ( ! link.labels && ! link.projectSlugs && ! link.template ) {
				// If there's no other customization, lets default to the /choose route
				// which lets users pick a template.
				pathEnd = 'new/choose';
			}
			url.pathname = urlJoin( link.repository, 'issues', pathEnd );

			if ( issueTitle ) {
				url.searchParams.append( 'title', issueTitle );
			}

			if ( link.template ) {
				url.searchParams.append( 'template', link.template );
			}

			if ( link.projectSlugs && link.projectSlugs.length > 0 ) {
				url.searchParams.append( 'projects', link.projectSlugs.join( ',' ) );
			}

			if ( link.labels && link.labels.length > 0 ) {
				url.searchParams.append( 'labels', link.labels.join( ',' ) );
			}

			return url.href;
		}
		case 'slack': {
			const url = new URL( 'https://slack.com/app_redirect' );
			url.searchParams.append( 'channel', link.channel );
			return url.href;
		}
		case 'p2': {
			// TODO: we need to probably sanitize this somehow
			const safeSubdomain = link.subdomain;
			const url = new URL( `https://${ safeSubdomain }.wordpress.com` );
			return url.href;
		}
	}
}

function getAppIcon( link: TaskLink ): ReactNode {
	switch ( link.type ) {
		case 'general':
			return null;
		case 'github':
			return <GithubIcon className={ styles.appIcon } />;
		case 'slack':
			return <SlackIcon className={ styles.appIcon } />;
		case 'p2':
			return <P2Icon className={ styles.appIcon } />;
	}
}
