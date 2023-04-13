import React, { ReactNode } from 'react';
import { Issue } from '../types';
import { formatDistance, format } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import styles from '../duplicate-results.module.css';
import { TextMatchHighlighter } from '../../common/components';
import { ReactComponent as OpenIcon } from '../svgs/open-icon.svg';
import { ReactComponent as ClosedIcon } from '../svgs/closed-icon.svg';
import { replaceSpaces } from '../../common/lib';

interface Props {
	issue: Issue;
}

export function IssueResult( { issue }: Props ) {
	const { title, url, content, status, dateCreated, dateUpdated, author, repo } = issue;

	const issueId = url.split( '/' ).pop(); // Last piece of the URL
	// Combo of repo and issue ID should make a unique ID we can use for various elements.
	const uniqueId = replaceSpaces( `${ repo }-${ issueId }` );

	const titleId = `title-${ uniqueId }`;
	const tooltipId = `tooltip-${ uniqueId }`;

	const repoWithoutOrg = repo.split( '/' )[ 1 ];

	const now = new Date();

	const dateCreatedDisplay = `Opened ${ formatDistance( new Date( dateCreated ), now, {
		addSuffix: true,
	} ) }`;
	const dateCreatedTooltip = format( new Date( dateCreated ), 'PPpppp' );

	const dateUpdatedDisplay = `Updated ${ formatDistance( new Date( dateUpdated ), now, {
		addSuffix: true,
	} ) }`;
	const dateUpdatedTooltip = format( new Date( dateUpdated ), 'PPpppp' );

	let statusIcon: ReactNode;
	if ( status === 'open' ) {
		statusIcon = (
			<OpenIcon data-testid="open-icon" aria-hidden="true" className={ styles.statusIcon } />
		);
	} else {
		statusIcon = (
			<ClosedIcon data-testid="closed-icon" aria-hidden="true" className={ styles.statusIcon } />
		);
	}

	const issueResultClasses = [ styles.issueResult ];
	if ( status === 'closed' ) {
		issueResultClasses.push( styles.closedIssue );
	} else {
		issueResultClasses.push( styles.openIssue );
	}

	const searchMatchRegex = /<em data-search-match>(.*?)<\/em>/g;

	return (
		<li className={ issueResultClasses.join( ' ' ) }>
			<a
				aria-labelledby={ titleId }
				className={ styles.issueLinkWrapper }
				target="_blank"
				href={ url }
				rel="noreferrer"
			>
				<div className={ styles.statusIconWrapper }>
					<span data-tooltip-id={ tooltipId } data-tooltip-content={ status }>
						{ statusIcon }
					</span>
				</div>
				<div className={ styles.issueDetailsWrapper }>
					<p className={ styles.issueTitle } id={ titleId }>
						{ title }
					</p>
					<p className={ styles.issueContent }>
						<TextMatchHighlighter
							textMatch={ searchMatchRegex }
							highlightClassName={ styles.searchMatch }
						>
							{ content }
						</TextMatchHighlighter>
					</p>
					<div className={ styles.issueMeta }>
						<span data-tooltip-id={ tooltipId } data-tooltip-content={ repo } aria-hidden="true">
							{ repoWithoutOrg }
						</span>
						<span className="screenReaderOnly">{ `Repository: ${ repo }` }</span>
						<span>{ author }</span>
						<span data-tooltip-id={ tooltipId } data-tooltip-content={ dateCreatedTooltip }>
							{ dateCreatedDisplay }
						</span>
						<span data-tooltip-id={ tooltipId } data-tooltip-content={ dateUpdatedTooltip }>
							{ dateUpdatedDisplay }
						</span>
					</div>
				</div>
			</a>
			<Tooltip id={ tooltipId } place="bottom" />
		</li>
	);
}
