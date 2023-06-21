import { createSelector } from '@reduxjs/toolkit';
import { selectActiveRepoFilters, selectStatusFilter } from '../issue-search/issue-search-slice';

export const selectDuplicateSearchFiltersAreActive = createSelector(
	[ selectStatusFilter, selectActiveRepoFilters ],
	( statusFilter, repoFilters ) => {
		return statusFilter !== 'all' || repoFilters.length > 0;
	}
);
