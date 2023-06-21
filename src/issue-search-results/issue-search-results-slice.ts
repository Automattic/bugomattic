import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { searchIssues } from '../issue-search/issue-search-slice';
import { IssueSearchResultsState } from './types';
import { startOver } from '../start-over/start-over-counter-slice';

const initialState: IssueSearchResultsState = {
	results: [],
	requestStatus: 'fulfilled',
	requestError: null,
	currentRequestId: '',
};

export const issueSearchResultsSlice = createSlice( {
	name: 'issueSearchResults',
	initialState,
	reducers: {},
	extraReducers: ( builder ) => {
		builder
			.addCase( searchIssues.pending, ( state, { meta } ) => {
				return {
					...state,
					requestStatus: 'pending',
					// createAsyncThunk automatically generates a unique requestId for each request! How helpful! :D
					// We can use this to make sure we only care about the most recently made search request
					// in the case of multiple requests being made in a short period of time.
					currentRequestId: meta.requestId,
				};
			} )
			.addCase( searchIssues.rejected, ( state, { error, meta } ) => {
				// This is an old request, ignore it
				if ( state.currentRequestId !== meta.requestId ) {
					return { ...state };
				}

				return {
					...state,
					requestStatus: 'error',
					requestError: `${ error.name }: ${ error.message }`,
				};
			} )
			.addCase( searchIssues.fulfilled, ( state, { payload, meta } ) => {
				// This is an old request, ignore it
				if ( state.currentRequestId !== meta.requestId ) {
					return { ...state };
				}

				return {
					...state,
					results: payload,
					requestStatus: 'fulfilled',
					requestError: null,
				};
			} )
			.addCase( startOver, () => {
				return { ...initialState };
			} );
	},
} );

export const issueSearchResultsReducer = issueSearchResultsSlice.reducer;

/* Selectors */

export function selectIssueSearchResults( state: RootState ) {
	return state.issueSearchResults.results;
}

export function selectIssueSearchResultsRequestStatus( state: RootState ) {
	return state.issueSearchResults.requestStatus;
}

export function selectIssueSearchResultsRequestError( state: RootState ) {
	return state.issueSearchResults.requestError;
}

export function selectIssueSearchRequestsWereMade( state: RootState ) {
	return state.issueSearchResults.currentRequestId !== '';
}
