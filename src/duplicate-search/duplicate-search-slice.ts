// Redux slice for duplicate search

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient, SearchIssueApiResponse } from '../api/types';
import { AppThunk, RootState } from '../app/store';
import { ActionWithStaticData } from '../static-data/types';
import { updateHistoryWithState, updateStateFromHistory } from '../url-history/actions';
import { DuplicateSearchState, IssueSortOption, IssueStatusFilter } from './types';
import { startOver } from '../start-over/start-over-counter-slice';

const initialState: DuplicateSearchState = {
	searchTerm: '',
	activeRepoFilters: [],
	statusFilter: 'all',
	sort: 'relevance',
};

const validIssueStatusFilters = new Set< IssueStatusFilter >( [ 'all', 'open', 'closed' ] );
const validIssueSortOptions = new Set< IssueSortOption >( [ 'date-created', 'relevance' ] );

export const searchIssues = createAsyncThunk<
	SearchIssueApiResponse,
	void,
	{ extra: { apiClient: ApiClient }; requestId: string }
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
		setActiveRepoFilters: ( state, { payload }: PayloadAction< string[] > ) => {
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
			.addCase( updateStateFromHistory, ( _state, action ) => {
				const duplicateSearchParamsFromUrl = action.payload.duplicateSearch;
				if ( ! duplicateSearchParamsFromUrl || typeof duplicateSearchParamsFromUrl !== 'object' ) {
					return { ...initialState };
				}

				// Validate the payload from history, and fall back to the initial state if invalid.

				let searchTerm: string;
				if (
					! duplicateSearchParamsFromUrl.searchTerm ||
					typeof duplicateSearchParamsFromUrl.searchTerm !== 'string'
				) {
					searchTerm = initialState.searchTerm;
				} else {
					searchTerm = duplicateSearchParamsFromUrl.searchTerm;
				}

				const actionWithStaticData = action as ActionWithStaticData;
				const avaliableRepoFiltersSet = new Set( actionWithStaticData.meta.availableRepoFilters );
				let activeRepoFilters: string[];
				if (
					! duplicateSearchParamsFromUrl.activeRepoFilters ||
					! Array.isArray( duplicateSearchParamsFromUrl.activeRepoFilters )
				) {
					activeRepoFilters = [ ...initialState.activeRepoFilters ];
				} else {
					activeRepoFilters = duplicateSearchParamsFromUrl.activeRepoFilters.filter( ( repo ) =>
						avaliableRepoFiltersSet.has( repo )
					);
				}

				let statusFilter: IssueStatusFilter;
				if (
					! duplicateSearchParamsFromUrl.statusFilter ||
					! validIssueStatusFilters.has( duplicateSearchParamsFromUrl.statusFilter )
				) {
					statusFilter = initialState.statusFilter;
				} else {
					statusFilter = duplicateSearchParamsFromUrl.statusFilter;
				}

				let sort: IssueSortOption;
				if (
					! duplicateSearchParamsFromUrl.sort ||
					! validIssueSortOptions.has( duplicateSearchParamsFromUrl.sort )
				) {
					sort = initialState.sort;
				} else {
					sort = duplicateSearchParamsFromUrl.sort;
				}

				return {
					searchTerm,
					activeRepoFilters,
					statusFilter,
					sort,
				};
			} )
			.addCase( startOver, () => {
				return { ...initialState };
			} );
	},
} );

export const { setSearchTerm, setActiveRepoFilters, setStatusFilter, setSort } =
	duplicateSearchSlice.actions;

type SearchAction =
	| ReturnType< typeof setSearchTerm >
	| ReturnType< typeof setActiveRepoFilters >
	| ReturnType< typeof setStatusFilter >
	| ReturnType< typeof setSort >;

// This is the action (actually, a thunk) creator that we will use in most components,
// as we will want to update history and change after any change to the search parameters.
// It's really just syntax sugar for dipatching the action and then the history and search action.
// But, I think it will read nicely in the components.
// E.g. dispatch( setSearchParam( setSearchTerm( 'foo' ) ) );
export function setSearchParam( action: SearchAction ): AppThunk {
	return ( dispatch ) => {
		dispatch( action );
		dispatch( updateHistoryWithState() );
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

export function selectDuplicateSearchParams( state: RootState ) {
	return state.duplicateSearch;
}
