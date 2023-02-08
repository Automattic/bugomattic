import { AnyAction, createAsyncThunk, createSlice, Middleware } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { ApiClient, ReportingConfigApiResponse } from '../api/types';
import { IndexedReportingConfig, NormalizedReportingConfig, ReportingConfigState } from './types';
import { indexReportingConfig, normalizeReportingConfig } from './reporting-config-parsers';
import { FeatureId } from '../issue-details/types';

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
					error: `${ error.name }: ${ error.message }`,
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
						status: 'error',
						error: `Failed to normalize reporting config. ${ error.name }: ${ error.message }`,
					};
				}

				return {
					...state,
					normalized: normalized,
					indexed: indexed,
					status: 'loaded',
					error: null,
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

export function selectReportingConfigLoadStatus( state: RootState ) {
	return state.reportingConfig.status;
}

export function selectReportingConfigError( state: RootState ) {
	return state.reportingConfig.error;
}

/**
 * This middleware adds a pointer to the normalized reporting config all actions' meta.
 * For simplicity, we've opted to keep the reporting config in the redux store, rather than in a separate context.
 * However, our "duck" pattern for redux slices means that we often can't access the reporting config in reducers.
 * This middleware solves that, so if any validation needs to happen based on the reporting config, it can.
 */
export const surfaceReportingConfigMiddleware: Middleware< {}, RootState > =
	( store ) => ( next ) => ( action: AnyAction ) => {
		const reportingConfig = selectNormalizedReportingConfig( store.getState() );

		action = {
			...action,
			meta: reportingConfig,
		};

		return next( action );
	};

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
