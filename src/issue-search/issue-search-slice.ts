// Redux slice for issue search

import { createAsyncThunk, createSlice, Middleware, PayloadAction } from '@reduxjs/toolkit';
import { ApiClient, SearchIssueApiResponse } from '../api/types';
import { AppDispatch, RootState } from '../app/store';
import { ActionWithStaticData } from '../static-data/types';
import { updateStateFromHistory } from '../url-history/actions';
import { IssueSearchState, IssueSortOption, IssueStatusFilter } from './types';
import { startOver } from '../start-over/start-over-counter-slice';
import deepEqual from 'deep-equal';

const initialState: IssueSearchState = {
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
>( 'issueSearch/searchIssues', async ( _, { extra, getState } ) => {
	const rootState = getState() as RootState;
	const searchTerm = selectIssueSearchTerm( rootState );
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

export const issueSearchSlice = createSlice( {
	name: 'issueSearch',
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
				const issueSearchParamsFromUrl = action.payload.issueSearch;
				if ( ! issueSearchParamsFromUrl || typeof issueSearchParamsFromUrl !== 'object' ) {
					return { ...initialState };
				}

				// Validate the payload from history, and fall back to the initial state if invalid.

				let searchTerm: string;
				if (
					! issueSearchParamsFromUrl.searchTerm ||
					typeof issueSearchParamsFromUrl.searchTerm !== 'string'
				) {
					searchTerm = initialState.searchTerm;
				} else {
					searchTerm = issueSearchParamsFromUrl.searchTerm;
				}

				const actionWithStaticData = action as ActionWithStaticData;
				const avaliableRepoFiltersSet = new Set( actionWithStaticData.meta.availableRepoFilters );
				let activeRepoFilters: string[];
				if (
					! issueSearchParamsFromUrl.activeRepoFilters ||
					! Array.isArray( issueSearchParamsFromUrl.activeRepoFilters )
				) {
					activeRepoFilters = [ ...initialState.activeRepoFilters ];
				} else {
					activeRepoFilters = issueSearchParamsFromUrl.activeRepoFilters.filter( ( repo ) =>
						avaliableRepoFiltersSet.has( repo )
					);
				}

				let statusFilter: IssueStatusFilter;
				if (
					! issueSearchParamsFromUrl.statusFilter ||
					! validIssueStatusFilters.has( issueSearchParamsFromUrl.statusFilter )
				) {
					statusFilter = initialState.statusFilter;
				} else {
					statusFilter = issueSearchParamsFromUrl.statusFilter;
				}

				let sort: IssueSortOption;
				if (
					! issueSearchParamsFromUrl.sort ||
					! validIssueSortOptions.has( issueSearchParamsFromUrl.sort )
				) {
					sort = initialState.sort;
				} else {
					sort = issueSearchParamsFromUrl.sort;
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
	issueSearchSlice.actions;

export const issueSearchReducer = issueSearchSlice.reducer;

/* Selectors */

export function selectIssueSearchTerm( state: RootState ) {
	return state.issueSearch.searchTerm;
}

export function selectActiveRepoFilters( state: RootState ) {
	return state.issueSearch.activeRepoFilters;
}

export function selectStatusFilter( state: RootState ) {
	return state.issueSearch.statusFilter;
}

export function selectSort( state: RootState ) {
	return state.issueSearch.sort;
}

export function selectIssueSearchParams( state: RootState ) {
	return state.issueSearch;
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

		const startingSearchParams = selectIssueSearchParams( store.getState() );
		next( action );
		const newSearchParams = selectIssueSearchParams( store.getState() );

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
