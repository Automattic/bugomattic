// Redux slice for duplicate search

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
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
		setSearchTermInternal: ( state, { payload }: PayloadAction< string > ) => {
			return {
				...state,
				searchTerm: payload,
			};
		},
		setRepoFiltersInternal: ( state, { payload }: PayloadAction< string[] > ) => {
			return {
				...state,
				activeRepoFilters: [ ...payload ],
			};
		},
		setStatusFilterInternal: ( state, { payload }: PayloadAction< IssueStatusFilter > ) => {
			return {
				...state,
				statusFilter: payload,
			};
		},
		setSortInternal: ( state, { payload }: PayloadAction< IssueSortOption > ) => {
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

const { setSearchTermInternal, setRepoFiltersInternal, setStatusFilterInternal, setSortInternal } =
	duplicateSearchSlice.actions;

// These are all the action creators that should be used, as we want to trigger a search after each one of these updates!

export const setSearchTerm = ( searchTerm: string ) => ( dispatch: AppDispatch ) => {
	dispatch( setSearchTermInternal( searchTerm ) );
	dispatch( searchIssues() );
};

export const setActiveRepoFilters = ( repoFilters: string[] ) => ( dispatch: AppDispatch ) => {
	dispatch( setRepoFiltersInternal( repoFilters ) );
	dispatch( searchIssues() );
};

export const setStatusFilter = ( statusFilter: IssueStatusFilter ) => ( dispatch: AppDispatch ) => {
	dispatch( setStatusFilterInternal( statusFilter ) );
	dispatch( searchIssues() );
};

export const setSort = ( sort: IssueSortOption ) => ( dispatch: AppDispatch ) => {
	dispatch( setSortInternal( sort ) );
	dispatch( searchIssues() );
};

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
