import React from 'react';
import { ReactComponent as NoResultsIllustration } from '../../common/svgs/missing-info.svg';
import styles from '../duplicate-results.module.css';

export function NoDuplicateResultsFound() {
	return (
		<div className={ styles.placeholderWrapper }>
			<NoResultsIllustration className={ styles.placeholderIllustration } />
			<h3 className={ styles.placeholderHeader }>No results found.</h3>
			<p className={ styles.placeholderText }>
				Try a different search or change your filters. You can also report a new issue below.
			</p>
		</div>
	);
}
