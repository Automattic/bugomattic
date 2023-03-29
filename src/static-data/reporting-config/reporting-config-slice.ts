import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { ApiClient, ReportingConfigApiResponse } from '../../api/types';
import { IndexedReportingConfig, NormalizedReportingConfig, ReportingConfigState } from './types';
import { indexReportingConfig, normalizeReportingConfig } from './reporting-config-parsers';
import { FeatureId } from '../../issue-details/types';

const initialNormalizedReportingConfig: NormalizedReportingConfig = {
	products: {},
	featureGroups: {},
	features: {},
	tasks: {},
};

const initialIndexedReportingConfig: IndexedReportingConfig = {
	foo: 'bar',
};

const initialState: ReportingConfigState = {
	normalized: initialNormalizedReportingConfig,
	indexed: initialIndexedReportingConfig,
	loadError: null,
};

export const loadReportingConfig = createAsyncThunk<
	ReportingConfigApiResponse,
	void,
	{ extra: { apiClient: ApiClient } }
>( 'reportingConfig/load', async ( _, { extra } ) => {
	const { apiClient } = extra;
	return await apiClient.loadReportingConfig();
} );

export const reportingConfigSlice = createSlice( {
	name: 'reportingConfig',
	initialState,
	reducers: {},
	extraReducers: ( builder ) => {
		builder
			.addCase( loadReportingConfig.rejected, ( state, { error } ) => {
				return {
					...state,
					loadError: `${ error.name }: ${ error.message }`,
				};
			} )
			.addCase( loadReportingConfig.fulfilled, ( state, { payload } ) => {
				let normalized: NormalizedReportingConfig;
				let indexed: IndexedReportingConfig;

				try {
					normalized = normalizeReportingConfig( payload );
					indexed = indexReportingConfig( payload );
				} catch ( err ) {
					const error = err as Error;
					return {
						...state,
						loadError: `Failed to normalize reporting config. ${ error.name }: ${ error.message }`,
					};
				}

				return {
					normalized: normalized,
					indexed: indexed,
					loadError: null,
				};
			} );
	},
} );

export const reportingConfigReducer = reportingConfigSlice.reducer;

/* Selectors */

export function selectReportingConfig( state: RootState ) {
	return state.reportingConfig;
}

export function selectNormalizedReportingConfig( state: RootState ) {
	return state.reportingConfig.normalized;
}

export function selectIndexedReportingConfig( state: RootState ) {
	return state.reportingConfig.indexed;
}

export function selectReportingConfigLoadError( state: RootState ) {
	return state.reportingConfig.loadError;
}

export function selectProductIdForFeature( featureId: FeatureId ) {
	return ( state: RootState ) => {
		if ( ! featureId ) {
			return null;
		}

		const feature = state.reportingConfig.normalized.features[ featureId ];
		if ( feature.parentType === 'product' ) {
			return feature.parentId;
		}

		const featureGroup = state.reportingConfig.normalized.featureGroups[ feature.parentId ];
		return featureGroup.productId;
	};
}
