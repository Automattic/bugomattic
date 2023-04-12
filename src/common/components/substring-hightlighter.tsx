import React from 'react';

interface Props {
	children: string;
	textMatch: string | RegExp;
	highlightClassName: string;
}

export function SubstringHighlighter( {
	children: content,
	textMatch,
	highlightClassName,
}: Props ) {
	if ( textMatch === '' || content === '' ) {
		return <>{ content }</>;
	}

	let regex: RegExp;
	if ( typeof textMatch === 'string' ) {
		regex = new RegExp( escapeStringForRegex( textMatch ), 'gi' );
	} else {
		regex = textMatch;
	}

	const outputParts = [];
	let currentIndex = 0;

	// Note: using indices as keys isn't generally recommended, but keys aren't really important here.
	// We'll always be re-rendering everything on each pass. We're just avoiding console errors.
	for ( const match of content.matchAll( regex ) ) {
		const fullMatchText = match[ 0 ];
		const captureGroupText = match[ 1 ];

		const matchStartIndex = match.index as number; // match.index is always defined when using matchAll.

		// Make sure the match isn't right at the start, or right after another match.
		if ( currentIndex !== matchStartIndex ) {
			// Add the text before the match.
			outputParts.push(
				<span key={ currentIndex }>{ content.slice( currentIndex, matchStartIndex ) }</span>
			);
		}

		// We support one capture group if given a regex. Otherwise, we just fall back to the full match.
		const matchDisplayText = captureGroupText ?? fullMatchText;
		// Add the matched, highlighted text.
		outputParts.push(
			<span
				key={ matchStartIndex }
				data-testid="highlighted-substring"
				className={ highlightClassName }
			>
				{ matchDisplayText }
			</span>
		);

		// Update the current index to the end of the match.
		currentIndex = matchStartIndex + fullMatchText.length;
	}

	outputParts.push( <span key={ currentIndex }>{ content.slice( currentIndex ) }</span> );

	return <>{ outputParts }</>;
}

function escapeStringForRegex( string: string ) {
	return string.replace( /[\\^$.*+?()[\]{}|]/g, '\\$&' );
}
