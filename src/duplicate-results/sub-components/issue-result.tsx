import React from 'react';
import { Issue } from '../types';
import { formatDistance, format } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import styles from '../duplciate-results.module.css';
import { SubstringHighlighter } from '../../common/components';

interface Props {
	issue: Issue;
}

export function IssueResult( { issue }: Props ) {
	const { title, url, content, status, dateCreated, dateUpdated, author, repo } = issue;

	const issueId = url.split( '/' ).pop();
	const tooltipId = `tooltip-${ repo }-${ issueId }`;

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

	const statusIcon = status === 'open' ? '🟢' : '🔴';

	const issueResultClasses = [ styles.issueResult ];
	if ( status === 'closed' ) {
		issueResultClasses.push( styles.closedIssue );
	} else {
		issueResultClasses.push( styles.openIssue );
	}

	const searchMatchRegex = /<em data-search-match>(.*?)<\/em>/g;

	return (
		<li className={ issueResultClasses.join( ' ' ) }>
			<div className={ styles.statusIconWrapper }>{ statusIcon }</div>
			<div>
				<p className={ styles.issueTitle }>
					<a target="_blank" href={ url } rel="noreferrer">
						{ title }
					</a>
				</p>
				<p className={ styles.issueContent }>
					<SubstringHighlighter
						textMatch={ searchMatchRegex }
						highlightClassName={ styles.searchMatch }
					>
						{ content }
					</SubstringHighlighter>
				</p>
				<div className={ styles.issueMeta }>
					<span>{ repoWithoutOrg }</span>
					<span>{ author }</span>
					<span data-tooltip-id={ tooltipId } data-tooltip-content={ dateCreatedTooltip }>
						{ dateCreatedDisplay }
					</span>
					<span data-tooltip-id={ tooltipId } data-tooltip-content={ dateUpdatedTooltip }>
						{ dateUpdatedDisplay }
					</span>
				</div>
				<Tooltip id={ tooltipId } />
			</div>
		</li>
	);
}
