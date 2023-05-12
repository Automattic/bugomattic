import React, { useMemo } from 'react';
import { Pill } from '../../common/components';
import styles from '../feature-selector-form.module.css';

interface Props {
	keywords: string[];
}

export function SortedKeywordList( { keywords }: Props ) {
	const sortedKeywords = useMemo( () => {
		const uniqueKeywords = Array.from( new Set( keywords ) );
		return uniqueKeywords.sort( ( a, b ) => a.localeCompare( b ) );
	}, [ keywords ] );

	return (
		<div
			data-testid={ 'selected-feature-keywords' }
			className={ styles.keywordsWrapper }
			aria-label="Keyword list"
		>
			{ sortedKeywords.map( ( keyword ) => (
				<Pill key={ keyword } pillClassName={ styles.keywordPill }>
					{ keyword }
				</Pill>
			) ) }
		</div>
	);
}
