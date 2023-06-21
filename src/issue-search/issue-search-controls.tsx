import React from 'react';
import { IssueSearchInput, RepoFilter, SortSelect, StatusFilter } from './sub-components';
import styles from './issue-search-controls.module.css';

export function IssueSearchControls() {
	return (
		<section>
			<div className={ styles.searchWrapper }>
				<IssueSearchInput />
			</div>
			<div className={ styles.filterSortBar }>
				<div className={ styles.filtersWrapper }>
					<StatusFilter />
					<RepoFilter />
				</div>
				<div>
					<SortSelect />
				</div>
			</div>
		</section>
	);
}
