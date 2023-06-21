// Redux slice for issue search

import { createAsyncThunk, createSlice, Middleware, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient, SearchIssueApiResponse } from '../api/types';
import { AppDispatch, RootState } from '../app/store';
import { ActionWithStaticData } from '../static-data/types';
import { updateStateFromHistory } from '../url-history/actions';
import { DuplicateSearchState, IssueSortOption, IssueStatusFilter } from './types';
import { startOver } from '../start-over/start-over-counter-slice';
import deepEqual from 'deep-equal';

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

const searchTriggeringActions: Set< string > = new Set( [
	setSearchTerm.type,
	setActiveRepoFilters.type,
	setStatusFilter.type,
	setSort.type,
	updateStateFromHistory.type,
] );

export const searchIssuesMiddleware: Middleware< {}, RootState > =
	( store ) => ( next ) => ( action ) => {
		if ( ! searchTriggeringActions.has( action.type ) ) {
			return next( action );
		}

		const startingSearchParams = selectDuplicateSearchParams( store.getState() );
		next( action );
		const newSearchParams = selectDuplicateSearchParams( store.getState() );

		const searchParamsDidNotChangeFromHistoryUpdate =
			action.type === updateStateFromHistory.type &&
			deepEqual( startingSearchParams, newSearchParams );

		if ( searchParamsDidNotChangeFromHistoryUpdate ) {
			// We don't want to fire off a search on every history update, that would be a lot!
			// We only care if the history change actually affected the search param state.
			return;
		}

		// For all other search parameter actions, we want to always search, even if they don't change!
		// This is consistent with common search engine behavior. Even if the user enters the same search content as before,
		// they expect a new search to fire.
		// The only exception is if the search term is empty, searching is meaningless in that case!
		if ( newSearchParams.searchTerm.trim() !== '' ) {
			// Deferring the typing here so there's not a circular type dependency with the store.
			const dispatch = store.dispatch as AppDispatch;
			dispatch( searchIssues() );
		}
	};
