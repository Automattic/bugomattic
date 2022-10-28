import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { ApiClient, ReportingConfigApiResponse } from '../api';
import { IndexedReportingConfig, NormalizedReportingConfig, ReportingConfigState } from './types';
import { indexReportingConfig, normalizeReportingConfig } from './reporting-config-parsers';

const initialNormalizedReportingConfig: NormalizedReportingConfig = {
	products: {},
	featureGroups: {},
	features: {},
};

const initialIndexedReportingConfig: IndexedReportingConfig = {
	foo: 'bar',
};

const initialState: ReportingConfigState = {
	normalized: initialNormalizedReportingConfig,
	indexed: initialIndexedReportingConfig,
	status: 'empty',
	error: null,
};

export const loadReportingConfig = createAsyncThunk<
	ReportingConfigApiResponse,
	void,
	{ extra: { apiClient: ApiClient } }
>( 'reportingConfig/loadReportingConfig', async ( _, { extra } ) => {
	const { apiClient } = extra;
	return await apiClient.loadReportingConfig();
} );

export const reportingConfigSlice = createSlice( {
	name: 'reportingConfig',
	initialState,
	reducers: {},
	extraReducers: ( builder ) => {
		builder
			.addCase( loadReportingConfig.pending, ( state ) => {
				return {
					...state,
					status: 'loading',
				};
			} )
			.addCase( loadReportingConfig.rejected, ( state, { error } ) => {
				return {
					...state,
					status: 'error',
					error: `${ error.name }: ${ error.message }}`,
				};
			} )
			.addCase( loadReportingConfig.fulfilled, ( state, { payload } ) => {
				return {
					normalized: normalizeReportingConfig( payload ),
					indexed: indexReportingConfig( payload ),
					status: 'loaded',
					error: null,
				};
			} );
	},
} );

export const reportingConfigReducer = reportingConfigSlice.reducer;

export function selectReportingConfig( state: RootState ) {
	return state.reportingConfig;
}

export function selectNormalizedReportingConfig( state: RootState ) {
	return state.reportingConfig.normalized;
}

export function selectIndexedReportingConfig( state: RootState ) {
	return state.reportingConfig.indexed;
}

export function selectReportingConfigLoadStatus( state: RootState ) {
	return state.reportingConfig.status;
}

export function selectReportingConfigError( state: RootState ) {
	return state.reportingConfig.error;
}
