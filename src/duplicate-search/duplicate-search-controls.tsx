import React from 'react';
import { DuplicateSearchInput, RepoFilter, SortSelect, StatusFilter } from './sub-components';
import styles from './duplicate-search-controls.module.css';

export function DuplicateSearchControls() {
	return (
		<section>
			<div className={ styles.searchWrapper }>
				<DuplicateSearchInput />
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
