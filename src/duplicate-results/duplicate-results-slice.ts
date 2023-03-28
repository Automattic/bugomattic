import { createSlice } from '@reduxjs/toolkit';
import { searchIssues } from '../duplicate-search/duplicate-search-slice';
import { DuplicateResultsState } from './types';

const initialState: DuplicateResultsState = {
	results: [],
	requestStatus: 'fulfilled',
	requestError: null,
};

export const duplicateResultsSlice = createSlice( {
	name: 'duplicateResults',
	initialState,
	reducers: {},
	extraReducers: ( builder ) => {
		builder
			.addCase( searchIssues.pending, ( state ) => {
				return {
					...state,
					requestStatus: 'pending',
				};
			} )
			.addCase( searchIssues.rejected, ( state, { error } ) => {
				return {
					...state,
					requestStatus: 'error',
					requestError: `${ error.name }: ${ error.message }`,
				};
			} )
			.addCase( searchIssues.fulfilled, ( state, { payload } ) => {
				return {
					...state,
					results: payload,
					requestStatus: 'fulfilled',
					requestError: null,
				};
			} );
	},
} );
