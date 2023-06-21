import React from 'react';
import { IssueSearchResults } from '../issue-search-results/issue-search-results';
import { IssueSearchControls } from '../issue-search/issue-search-controls';
import { usePageNavigation } from '../active-page/page-navigation-provider';
import styles from './issue-searching-page.module.css';

export function IssueSearchingPage() {
	const { pageHeadingRef } = usePageNavigation();
	return (
		<section className={ styles.wrapper }>
			<h2 ref={ pageHeadingRef } className="screenReaderOnly" tabIndex={ -1 }>
				Search for existing issues
			</h2>
			<IssueSearchControls />
			<IssueSearchResults />
		</section>
	);
}
