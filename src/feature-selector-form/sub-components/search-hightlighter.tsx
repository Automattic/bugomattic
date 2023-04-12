import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { TextMatchHighlighter } from '../../common/components';
import { selectFeatureSearchTerm } from '../feature-selector-form-slice';
import styles from '../feature-selector-form.module.css';

interface Props {
	children: string;
}

export function SearchHighlighter( { children }: Props ) {
	const searchTerm = useAppSelector( selectFeatureSearchTerm );

	return (
		<TextMatchHighlighter
			textMatch={ searchTerm }
			highlightClassName={ styles.searchSubstringMatch }
		>
			{ children }
		</TextMatchHighlighter>
	);
}
