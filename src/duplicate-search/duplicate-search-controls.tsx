import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAvailableRepoFilters } from '../static-data/available-repo-filters/available-repo-filters-slice';
import { updateHistoryWithState } from '../url-history/actions';
import {
	setActiveRepoFilters,
	setSearchTerm,
	setSort,
	setStatusFilter,
	withSearchAfter,
} from './duplicate-search-slice';

// TODO: This is a placeholder component for the duplicate search controls. Modify and tweak however needed! :)
export function DuplicateSearchControls() {
	const dispatch = useAppDispatch();
	const repoFilters = useAppSelector( selectAvailableRepoFilters );

	const handleFauxSearch = () => {
		dispatch( setSearchTerm( 'Test search term' ) );
		dispatch( setStatusFilter( 'open' ) );
		dispatch( setActiveRepoFilters( [] ) );
		dispatch( withSearchAfter( setSort( 'relevance' ) ) );
		dispatch( updateHistoryWithState() );
	};

	return (
		<section>
			<p>This is just a filler component</p>
			<button onClick={ handleFauxSearch }>Faux search</button>
			<p>Available repo filters: { repoFilters.join( ', ' ) }</p>
		</section>
	);
}
