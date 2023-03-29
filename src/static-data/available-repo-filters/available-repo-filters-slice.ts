import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiClient, AvailableRepoFiltersApiResponse } from '../../api/types';
import { RootState } from '../../app/store';
import { AvailableRepoFiltersState } from './types';

const initialState: AvailableRepoFiltersState = {
	repos: [],
	loadError: null,
};

export const loadAvailableRepoFilters = createAsyncThunk<
	AvailableRepoFiltersApiResponse,
	void,
	{ extra: { apiClient: ApiClient } }
>( 'availableRepoFilters/load', async ( _, { extra } ) => {
	const { apiClient } = extra;
	return await apiClient.getAvailableRepoFilters();
} );

export const availableRepoFiltersSlice = createSlice( {
	name: 'availableRepoFilters',
	initialState,
	reducers: {},
	extraReducers: ( builder ) => {
		builder
			.addCase( loadAvailableRepoFilters.rejected, ( state, { error } ) => {
				return {
					...state,
					loadError: `${ error.name }: ${ error.message }`,
				};
			} )
			.addCase( loadAvailableRepoFilters.fulfilled, ( state, { payload } ) => {
				return {
					...state,
					repos: payload,
				};
			} );
	},
} );

export const availableRepoFiltersReducer = availableRepoFiltersSlice.reducer;

export function selectAvailableRepoFilters( state: RootState ) {
	return state.availableRepoFilters.repos;
}

export function selectAvailableRepoFiltersLoadError( state: RootState ) {
	return state.availableRepoFilters.loadError;
}
