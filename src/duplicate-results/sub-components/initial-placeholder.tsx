import React from 'react';
import { ReactComponent as PlaceholderIllustration } from './initial-placeholder.svg';
import styles from '../duplicate-results.module.css';

export function DuplicateResultsInitialPlaceholder() {
	return (
		<div className={ styles.placeholderWrapper }>
			<PlaceholderIllustration className={ styles.placeholderIllustration } />
			<h3 className={ styles.placeholderHeader }>Enter some keywords to search for duplicates.</h3>
			<p className={ styles.placeholderText }>
				Click on “Report an Issue” to open a bug, request a few feature, and more.
			</p>
		</div>
	);
}
