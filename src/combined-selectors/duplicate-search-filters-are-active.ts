import { createSelector } from '@reduxjs/toolkit';
import {
	selectActiveRepoFilters,
	selectStatusFilter,
} from '../duplicate-search/duplicate-search-slice';

export const selectDuplicateSearchFiltersAreActive = createSelector(
	[ selectStatusFilter, selectActiveRepoFilters ],
	( statusFilter, repoFilters ) => {
		return statusFilter !== 'all' || repoFilters.length > 0;
	}
);
