import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { TextMatchHighlighter } from '../../common/components';
import { selectFeatureSearchTerm } from '../feature-selector-form-slice';
import styles from '../feature-selector-form.module.css';
import { escapeStringForRegex, tokenizeAndNormalize } from '../../common/lib';

interface Props {
	children: string;
	tokenize?: boolean;
}

export function SearchHighlighter( { children, tokenize }: Props ) {
	const searchTerm = useAppSelector( selectFeatureSearchTerm );

	let textMatchSearch: string | RegExp = searchTerm;

	if ( tokenize ) {
		const tokenizedSearchTerm = tokenizeAndNormalize( searchTerm );
		// We only want to build the capture group if there are real tokens to capture.
		// Otherwise we're passing a really confusing and permissive RegExp down!
		if ( tokenizedSearchTerm.length > 0 ) {
			textMatchSearch = new RegExp(
				// The escaping is probably overkill here following tokenizeAndNormalize(),
				// but it we should be careful and agnostic of that function's implementation.
				`\\b(${ tokenizedSearchTerm.map( escapeStringForRegex ).join( '|' ) })\\b`,
				'gi'
			);
		} else {
			textMatchSearch = '';
		}
	}

	return (
		<TextMatchHighlighter
			textMatch={ textMatchSearch }
			highlightClassName={ styles.searchSubstringMatch }
		>
			{ children }
		</TextMatchHighlighter>
	);
}
