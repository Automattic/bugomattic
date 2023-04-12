import React from 'react';

interface Props {
	children: string;
	textMatch: string | RegExp;
	highlightClassName: string;
}

export function TextMatchHighlighter( {
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
	let endIndexOfLastMatch = 0;

	// Note: using indices as React keys isn't generally recommended, but it's the right call here.
	// We'll always be re-rendering everything on each pass. We're just avoiding console errors.
	for ( const match of content.matchAll( regex ) ) {
		const fullMatchText = match[ 0 ];
		const captureGroupText = match[ 1 ];

		const matchStartIndex = match.index as number; // match.index is always defined when using matchAll.

		// Make sure the match isn't right at the start, or right after another match.
		if ( endIndexOfLastMatch !== matchStartIndex ) {
			// And if it's not, add the text before the match.
			outputParts.push(
				<span key={ endIndexOfLastMatch }>
					{ content.slice( endIndexOfLastMatch, matchStartIndex ) }
				</span>
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
		endIndexOfLastMatch = matchStartIndex + fullMatchText.length;
	}

	outputParts.push(
		<span key={ endIndexOfLastMatch }>{ content.slice( endIndexOfLastMatch ) }</span>
	);

	return <>{ outputParts }</>;
}

function escapeStringForRegex( string: string ) {
	return string.replace( /[\\^$.*+?()[\]{}|]/g, '\\$&' );
}
