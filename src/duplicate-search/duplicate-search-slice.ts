// Redux slice for duplicate search

import { Action, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient, SearchIssueApiResponse } from '../api/types';
import { AppDispatch, RootState } from '../app/store';
import { ActionWithStaticData } from '../static-data/types';
import { updateStateFromHistory } from '../url-history/actions';
import { DuplicateSearchState, IssueSortOption, IssueStatusFilter } from './types';

const initialState: DuplicateSearchState = {
	searchTerm: '',
	// To differentiate from the available repo filters.
	activeRepoFilters: [],
	statusFilter: 'all',
	sort: 'relevance',
};

const validIssueStatusFilters = new Set< IssueStatusFilter >( [ 'all', 'open', 'closed' ] );
const validIssueSortOptions = new Set< IssueSortOption >( [ 'date-created', 'relevance' ] );

export const searchIssues = createAsyncThunk<
	SearchIssueApiResponse,
	void,
	{ extra: { apiClient: ApiClient } }
>( 'duplicateSearch/searchIssues', async ( _, { extra, getState } ) => {
	const rootState = getState() as RootState;
	const searchTerm = selectDuplicateSearchTerm( rootState );
	const activeRepoFilters = selectActiveRepoFilters( rootState );
	const statusFilter = selectStatusFilter( rootState );
	const sort = selectSort( rootState );

	const { apiClient } = extra;
	return await apiClient.searchIssues( searchTerm, {
		repos: activeRepoFilters,
		status: statusFilter,
		sort,
	} );
} );

export const duplicateSearchSlice = createSlice( {
	name: 'duplicateSearch',
	initialState,
	reducers: {
		setSearchTerm: ( state, { payload }: PayloadAction< string > ) => {
			return {
				...state,
				searchTerm: payload,
			};
		},
		setRepoFilters: ( state, { payload }: PayloadAction< string[] > ) => {
			return {
				...state,
				activeRepoFilters: [ ...payload ],
			};
		},
		setStatusFilter: ( state, { payload }: PayloadAction< IssueStatusFilter > ) => {
			return {
				...state,
				statusFilter: payload,
			};
		},
		setSort: ( state, { payload }: PayloadAction< IssueSortOption > ) => {
			return {
				...state,
				sort: payload,
			};
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( updateStateFromHistory, ( _state, action ) => {
			const duplicateSearchInfo = action.payload.duplicateSearch;
			if ( ! duplicateSearchInfo || typeof duplicateSearchInfo !== 'object' ) {
				return { ...initialState };
			}

			// Validate the payload from history, and fall back to the initial state if invalid.

			let searchTerm: string;
			if (
				! duplicateSearchInfo.searchTerm ||
				typeof duplicateSearchInfo.searchTerm !== 'string'
			) {
				searchTerm = initialState.searchTerm;
			} else {
				searchTerm = duplicateSearchInfo.searchTerm;
			}

			const actionWithStaticData = action as ActionWithStaticData;
			const avaliableRepoFiltersSet = new Set( actionWithStaticData.meta.availableRepoFilters );
			let activeRepoFilters: string[];
			if (
				! duplicateSearchInfo.activeRepoFilters ||
				! Array.isArray( duplicateSearchInfo.activeRepoFilters )
			) {
				activeRepoFilters = [ ...initialState.activeRepoFilters ];
			} else {
				activeRepoFilters = duplicateSearchInfo.activeRepoFilters.filter( ( repo ) =>
					avaliableRepoFiltersSet.has( repo )
				);
			}

			let statusFilter: IssueStatusFilter;
			if (
				! duplicateSearchInfo.statusFilter ||
				! validIssueStatusFilters.has( duplicateSearchInfo.statusFilter )
			) {
				statusFilter = initialState.statusFilter;
			} else {
				statusFilter = duplicateSearchInfo.statusFilter;
			}

			let sort: IssueSortOption;
			if ( ! duplicateSearchInfo.sort || ! validIssueSortOptions.has( duplicateSearchInfo.sort ) ) {
				sort = initialState.sort;
			} else {
				sort = duplicateSearchInfo.sort;
			}

			return {
				searchTerm,
				activeRepoFilters,
				statusFilter,
				sort,
			};
		} );
	},
} );

export const { setSearchTerm, setRepoFilters, setStatusFilter, setSort } =
	duplicateSearchSlice.actions;

// This is the action (actually, a thunk) creator that we will use in most components,
// as we will want to search after any change to the search parameters.
// E.g. dispatch( withSearchAfter( setSearchTerm( 'foo' ) ) );
export function withSearchAfter( action: Action ) {
	return ( dispatch: AppDispatch ) => {
		dispatch( action );
		dispatch( searchIssues() );
	};
}

export const duplicateSearchReducer = duplicateSearchSlice.reducer;

/* Selectors */

export function selectDuplicateSearchTerm( state: RootState ) {
	return state.duplicateSearch.searchTerm;
}

export function selectActiveRepoFilters( state: RootState ) {
	return state.duplicateSearch.activeRepoFilters;
}

export function selectStatusFilter( state: RootState ) {
	return state.duplicateSearch.statusFilter;
}

export function selectSort( state: RootState ) {
	return state.duplicateSearch.sort;
}
