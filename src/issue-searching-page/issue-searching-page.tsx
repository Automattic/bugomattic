import React from 'react';
import { DuplicateResults } from '../issue-search-results/issue-search-results';
import { DuplicateSearchControls } from '../issue-search/issue-search-controls';
import { usePageNavigation } from '../active-page/page-navigation-provider';
import styles from './issue-searching-page.module.css';

export function DuplicateSearchingPage() {
	const { pageHeadingRef } = usePageNavigation();
	return (
		<section className={ styles.wrapper }>
			<h2 ref={ pageHeadingRef } className="screenReaderOnly" tabIndex={ -1 }>
				Search for duplicate issues
			</h2>
			<DuplicateSearchControls />
			<DuplicateResults />
		</section>
	);
}
