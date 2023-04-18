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
import { StatusFilter } from './sub-components';
import { ActionPopover, ActionPopoverContent, ActionPopoverTrigger } from '../common/components';
import { offset } from '@floating-ui/react';

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
			<div>
				<StatusFilter />
				<ActionPopover floatingUiPlacement="bottom-start">
					<ActionPopoverTrigger>Repositories</ActionPopoverTrigger>
					<ActionPopoverContent actionLabel="Filter" onAction={ () => alert( 'Hi!' ) }>
						<p>Available repo filters: { repoFilters.join( ', ' ) }</p>
					</ActionPopoverContent>
				</ActionPopover>
			</div>
		</section>
	);
}
