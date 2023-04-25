import React from 'react';
import { RepoFilter, StatusFilter } from './sub-components';
import { useAppDispatch } from '../app/hooks';
import { setSearchTerm, setSearchParam } from './duplicate-search-slice';
import { DebouncedSearch } from '../common/components';
import styles from './duplicate-search-controls.module.css';

// TODO: This is a placeholder component for the duplicate search controls. Modify and tweak however needed! :)
export function DuplicateSearchControls() {
	const dispatch = useAppDispatch();

	const handleSearchTerm = ( searchTerm: string ) => {
		dispatch( setSearchParam( setSearchTerm( searchTerm ) ) );
	};

	return (
		<section>
			<div className={ styles.searchWrapper }>
				<DebouncedSearch
					placeholder="Search for duplicate issues"
					callback={ handleSearchTerm }
					inputAriaLabel="Search for duplicate issues"
					debounceMs={ 500 }
				/>
			</div>
			<div className={ styles.filterSortBar }>
				<div className={ styles.filterControls }>
					<StatusFilter />
					<RepoFilter />
				</div>
			</div>
		</section>
	);
}
