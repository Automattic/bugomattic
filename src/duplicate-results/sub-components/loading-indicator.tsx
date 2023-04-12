import React from 'react';
import { AnimatedEllipsis } from '../../common/components';
import styles from '../duplicate-results.module.css';

export function DuplicateResultsLoadingIndicator() {
	return (
		<div className={ styles.loadingWrapper }>
			<span className={ styles.loadingMessage }>Finding some duplicate issues...</span>
			<AnimatedEllipsis />
		</div>
	);
}
