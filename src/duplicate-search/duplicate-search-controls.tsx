import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAvailableRepoFilters } from '../static-data/available-repo-filters/available-repo-filters-slice';
import {
	setActiveRepoFilters,
	setSearchTerm,
	setSort,
	setStatusFilter,
	setSearchParam,
} from './duplicate-search-slice';

// TODO: This is a placeholder component for the duplicate search controls. Modify and tweak however needed! :)
export function DuplicateSearchControls() {
	const dispatch = useAppDispatch();
	const repoFilters = useAppSelector( selectAvailableRepoFilters );

	const handleFauxSearch = () => {
		dispatch( setSearchTerm( 'Test search term' ) );
		dispatch( setStatusFilter( 'open' ) );
		dispatch( setActiveRepoFilters( [] ) );

		// What the dispatch in most components will actually look like
		dispatch( setSearchParam( setSort( 'relevance' ) ) );
	};

	return (
		<section>
			<p>This is just a filler component</p>
			<button onClick={ handleFauxSearch }>Faux search</button>
			<p>Available repo filters: { repoFilters.join( ', ' ) }</p>
		</section>
	);
}
