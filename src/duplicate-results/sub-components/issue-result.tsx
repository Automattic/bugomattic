import React from 'react';
import { Issue } from '../types';
import { formatDistance, format } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import styles from '../duplciate-results.module.css';

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

	return (
		<li className={ issueResultClasses.join( ' ' ) }>
			<div className={ styles.statusIconWrapper }>{ statusIcon }</div>
			<div>
				<p className={ styles.issueTitle }>
					<a target="_blank" href={ url } rel="noreferrer">
						{ title }
					</a>
				</p>
				<p className={ styles.issueContent }>{ highlightSearchMatches( content ) }</p>
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

function highlightSearchMatches( content: string ) {
	const regex = /<em data-search-match>(.*?)<\/em>/g;
	const outputParts = [];
	let currentIndex = 0;

	// Using indices as keys isn't generally recommended, but keys aren't really important here.
	// We'll always be re-rendering everything on each pass.

	for ( const match of content.matchAll( regex ) ) {
		const fullMatchText = match[ 0 ];
		const captureGroupText = match[ 1 ];
		const matchStartIndex = match.index as number; // match.index is always defined when using matchAll.

		// Add the text before the match.
		outputParts.push(
			<span key={ currentIndex }>{ content.slice( currentIndex, matchStartIndex ) }</span>
		);

		// Add the matched, highlighted text.
		outputParts.push(
			<span
				key={ matchStartIndex }
				data-testid="highlighted-substring"
				className={ styles.searchMatch }
			>
				{ captureGroupText }
			</span>
		);

		// Update the current index to the end of the match.
		currentIndex = matchStartIndex + fullMatchText.length;
	}

	outputParts.push( <span key={ currentIndex }>{ content.slice( currentIndex ) }</span> );

	return outputParts;
}
