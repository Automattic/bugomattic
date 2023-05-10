import React from 'react';

import { Pill, TextMatchHighlighter } from '../../common/components';
import { ReactComponent as MatchIcon } from '../../common/svgs/match.svg';
import styles from './../feature-selector-form.module.css';

interface Props {
	searchTerm: string;
	matchedTerms: string[];
	strongestMatchTerm?: string;
	matchType: 'description' | 'keyword';
}

export function MatchedTermsDisplay( {
	searchTerm,
	matchedTerms,
	strongestMatchTerm,
	matchType,
}: Props ) {
	const searchTermRegExp = createWordMatchingForRegex( searchTerm );

	let matches;
	if ( matchType === 'description' ) {
		const remainingMatches = Array.from( matchedTerms ).filter(
			( term ) => term !== strongestMatchTerm
		);
		const matchedTermsDisplay =
			remainingMatches.length > 1
				? ` +${ remainingMatches.length } more`
				: remainingMatches.length === 1
				? `, ${ remainingMatches }`
				: '';
		matches = `${ strongestMatchTerm }${ matchedTermsDisplay }`;
	} else {
		matches = `${ matchedTerms }`;
	}

	return (
		<span className={ styles.termMatchesWrapper }>
			<Pill key={ matchType } highlightClassName={ styles.matchedPill }>
				<MatchIcon data-testid="match-icon" aria-hidden={ true } className={ styles.appIcon } />
				{ `${ matchType } match: ` }
				<TextMatchHighlighter
					textMatch={ searchTermRegExp }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ matches }
				</TextMatchHighlighter>
			</Pill>
		</span>
	);
}

function createWordMatchingForRegex( string: string ) {
	return new RegExp( string.split( /\s+/ ).join( '|' ), 'gi' );
}
