import React from 'react';
import { useAppSelector } from '../../app';
import { SubstringHighlighter } from '../../common';
import { selectFeatureSearchTerm } from '../feature-selector-form-slice';
import styles from '../feature-selector-form.module.css';

interface Props {
	children: string;
}

export function SearchHighlighter( { children }: Props ) {
	const searchTerm = useAppSelector( selectFeatureSearchTerm );

	return (
		<SubstringHighlighter
			substring={ searchTerm }
			highlightClassName={ styles.searchSubstringMatch }
		>
			{ children }
		</SubstringHighlighter>
	);
}
