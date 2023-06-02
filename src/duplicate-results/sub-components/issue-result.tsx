import React, { ReactNode } from 'react';
import { Issue } from '../types';
import { formatDistance, format } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import styles from '../duplicate-results.module.css';
import { TextMatchHighlighter } from '../../common/components';
import { ReactComponent as OpenIcon } from '../svgs/open-issue.svg';
import { ReactComponent as ClosedIcon } from '../svgs/closed-issue.svg';
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

	const dateCreatedDisplay = `Created ${ formatDistance( new Date( dateCreated ), now, {
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
			<OpenIcon
				data-tooltip-id={ tooltipId }
				data-tooltip-content="Open"
				data-testid="open-icon"
				role="img"
				tabIndex={ -1 }
				className={ `${ styles.statusIcon } ${ styles.openIcon }` }
			/>
		);
	} else {
		statusIcon = (
			<ClosedIcon
				data-tooltip-id={ tooltipId }
				data-tooltip-content="Closed"
				data-testid="closed-icon"
				role="img"
				tabIndex={ -1 }
				className={ `${ styles.statusIcon } ${ styles.closedIcon }` }
			/>
		);
	}

	const issueResultClasses = [ styles.issueResult ];
	if ( status === 'closed' ) {
		issueResultClasses.push( styles.closedIssue );
	} else {
		issueResultClasses.push( styles.openIssue );
	}

	// I strongly prefer to do this using Regex capturing vs Reacts "dangerouslySetInnerHTML".
	// That way, we avoid all XSS risk, and we are future proofed in case the search match markup
	// changes in the future to not be HTML tags.
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
				<div className={ styles.statusIconWrapper }>{ statusIcon }</div>
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
						<span aria-hidden="true">{ author }</span>
						<span
							data-tooltip-id={ tooltipId }
							data-tooltip-content={ dateCreatedTooltip }
							aria-hidden="true"
						>
							{ dateCreatedDisplay }
						</span>
						<span
							data-tooltip-id={ tooltipId }
							data-tooltip-content={ dateUpdatedTooltip }
							aria-hidden="true"
						>
							{ dateUpdatedDisplay }
						</span>

						<span className="screenReaderOnly">{ `Repository: ${ repo }` }</span>
						<span className="screenReaderOnly">{ `Author: ${ author }` }</span>
						<span className="screenReaderOnly">{ `${ dateCreatedDisplay }: ${ dateCreatedTooltip }` }</span>
						<span className="screenReaderOnly">{ `${ dateUpdatedDisplay }: ${ dateUpdatedTooltip }` }</span>
					</div>
				</div>
			</a>
			<Tooltip id={ tooltipId } place="bottom" />
		</li>
	);
}
