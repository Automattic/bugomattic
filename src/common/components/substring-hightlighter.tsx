import React from 'react';

interface Props {
	children: string;
	substring: string;
	highlightClassName: string;
	ignoreCase?: boolean;
}

export function SubstringHighlighter( {
	children: string,
	substring,
	highlightClassName,
	ignoreCase = true,
}: Props ) {
	if ( substring === '' ) {
		return <span>{ string }</span>;
	}

	let substringStartingIndex: number;
	if ( ignoreCase ) {
		substringStartingIndex = string.toUpperCase().indexOf( substring.toUpperCase() );
	} else {
		substringStartingIndex = string.indexOf( substring );
	}

	if ( substringStartingIndex === -1 ) {
		return <span>{ string }</span>;
	}

	const substringEndingIndex = substringStartingIndex + substring.length;

	const startingSlice = string.slice( 0, substringStartingIndex );
	const hightlightedSlice = string.slice( substringStartingIndex, substringEndingIndex );
	const endingSlice = string.slice( substringEndingIndex );

	return (
		<span>
			{ startingSlice }
			<span className={ highlightClassName }>{ hightlightedSlice }</span>
			{ endingSlice }
		</span>
	);
}
