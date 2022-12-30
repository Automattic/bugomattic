import React from 'react';
import { useAppSelector } from '../../app';
import { SubstringHighlighter } from '../../common';
import { selectReportingConfigSearchTerm } from '../../reporting-config';
import styles from '../feature-selector.module.css';

interface Props {
	children: string;
}

export function SearchHighlighter( { children }: Props ) {
	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );

	return (
		<SubstringHighlighter
			substring={ searchTerm }
			highlightClassName={ styles.searchSubstringMatch }
		>
			{ children }
		</SubstringHighlighter>
	);
}
