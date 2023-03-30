import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { searchIssues } from '../duplicate-search/duplicate-search-slice';
import { DuplicateResultsState } from './types';

const initialState: DuplicateResultsState = {
	results: [],
	requestStatus: 'fulfilled',
	requestError: null,
	currentRequestId: '',
};

export const duplicateResultsSlice = createSlice( {
	name: 'duplicateResults',
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
			} );
	},
} );

export const duplicateResultsReducer = duplicateResultsSlice.reducer;

/* Selectors */

export function selectDuplicateResults( state: RootState ) {
	return state.duplicateResults.results;
}

export function selectDuplicateResultsRequestStatus( state: RootState ) {
	return state.duplicateResults.requestStatus;
}

export function selectDuplicateResultsRequestError( state: RootState ) {
	return state.duplicateResults.requestError;
}
