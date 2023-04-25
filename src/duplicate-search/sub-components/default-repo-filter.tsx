import React from 'react';
import { ReactComponent as DefaultFilterIllustration } from '../svgs/default-filter-illustration.svg';
import styles from '../duplicate-search-controls.module.css';

export function DefaultRepoFilter() {
	return (
		<div>
			<h3 className="screenReaderOnly">Default filter mode</h3>
			<p className={ styles.repoFilterModeDescription }>
				A curated selection of the most used repositories, weighted to help show more relevant
				results.
			</p>
			<DefaultFilterIllustration aria-hidden={ true } className={ styles.repoFilterIllustration } />
		</div>
	);
}
