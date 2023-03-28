// Redux slice for duplicate search

import { Action, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient, AvailableRepoFiltersApiResponse, SearchIssueApiResponse } from '../api/types';
import { AppDispatch, RootState } from '../app/store';
import { DuplicateSearchState, IssueSortOption, IssueStatusFilter } from './types';

const initialState: DuplicateSearchState = {
	searchTerm: '',
	// To differentiate from the available repo filters.
	activeRepoFilters: [],
	statusFilter: 'all',
	sort: 'relevance',
	availableRepoFilters: {
		repos: [],
		requestStatus: 'empty',
		requestError: null,
	},
};

export const loadAvailableRepoFilters = createAsyncThunk<
	AvailableRepoFiltersApiResponse,
	void,
	{ extra: { apiClient: ApiClient } }
>( 'duplicateSearch/loadAvailableRepoFilters', async ( _, { extra } ) => {
	const { apiClient } = extra;
	return await apiClient.getAvailableRepoFilters();
} );

export const searchIssues = createAsyncThunk<
	SearchIssueApiResponse,
	void,
	{ extra: { apiClient: ApiClient } }
>( 'duplicateResults/searchIssues', async ( _, { extra, getState } ) => {
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
		builder
			.addCase( loadAvailableRepoFilters.pending, ( state ) => {
				return {
					...state,
					availableRepoFilters: {
						...state.availableRepoFilters,
						requestStatus: 'loading',
					},
				};
			} )
			.addCase( loadAvailableRepoFilters.rejected, ( state, { error } ) => {
				return {
					...state,
					availableRepoFilters: {
						...state.availableRepoFilters,
						requestStatus: 'error',
						requestError: `${ error.name }: ${ error.message }`,
					},
				};
			} )
			.addCase( loadAvailableRepoFilters.fulfilled, ( state, { payload } ) => {
				return {
					...state,
					availableRepoFilters: {
						...state.availableRepoFilters,
						requestStatus: 'loaded',
						repos: payload,
					},
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

export function selectAvailableRepoFilters( state: RootState ) {
	return state.duplicateSearch.availableRepoFilters.repos;
}

export function selectAvailableRepoFiltersRequestStatus( state: RootState ) {
	return state.duplicateSearch.availableRepoFilters.requestStatus;
}

export function selectAvailableRepoFiltersRequestError( state: RootState ) {
	return state.duplicateSearch.availableRepoFilters.requestError;
}
