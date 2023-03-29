import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
	selectAvailableRepoFilters,
	selectAvailableRepoFiltersLoadStatus,
} from '../static-data/available-repo-filters/available-repo-filters-slice';
import { updateHistoryWithState } from '../url-history/actions';
import {
	setRepoFilters,
	setSearchTerm,
	setSort,
	setStatusFilter,
	withSearchAfter,
} from './duplicate-search-slice';

// TODO: This is a placeholder component for the duplicate search controls. Modify and tweak however needed! :)
export function DuplicateSearchControls() {
	const dispatch = useAppDispatch();
	const repoFilters = useAppSelector( selectAvailableRepoFilters );
	const repoFilterLoadStatus = useAppSelector( selectAvailableRepoFiltersLoadStatus );

	const handleFauxSearch = () => {
		dispatch( setSearchTerm( 'Test search term' ) );
		dispatch( setStatusFilter( 'open' ) );
		dispatch( setRepoFilters( [] ) );
		dispatch( withSearchAfter( setSort( 'relevance' ) ) );
		dispatch( updateHistoryWithState() );
	};

	let repoFiltersDisplay: string;
	if ( repoFilterLoadStatus === 'loading' ) {
		repoFiltersDisplay = 'Loading...';
	} else {
		repoFiltersDisplay = repoFilters.join( ', ' );
	}

	return (
		<section>
			<p>This is just a filler component</p>
			<button onClick={ handleFauxSearch }>Faux search</button>
			<p>Available repo filters: { repoFiltersDisplay }</p>
		</section>
	);
}
