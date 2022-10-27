import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { ApiClient, ReportingConfigApiResponse } from '../api';
import {
	IndexedReportingConfig,
	NormalizedReportingConfig,
	ReportingConfigState,
	Task,
} from './types';
import { indexReportingConfig, normalizeReportingConfig } from './reporting-config-parsers';
import { EntityType, SourcedTask } from '../active-tasks';

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

export function selectRelevantTasks( state: RootState ): SourcedTask[] {
	const { issueDetails, reportingConfig } = state;
	const { featureId, issueType } = issueDetails;
	const { normalized } = reportingConfig;

	if ( featureId === null || issueType === 'unset' ) {
		return [];
	}

	let sourcedFeatureTasks: SourcedTask[] = [];
	let sourcedFeatureGroupTasks: SourcedTask[] = [];
	let sourcedProductTasks: SourcedTask[] = [];

	const feature = normalized.features[ featureId ];
	const featureTasks = feature?.taskMapping?.[ issueType ];
	if ( featureTasks ) {
		sourcedFeatureTasks = featureTasks.map( makeTaskSourcer( featureId, 'feature' ) );
	}

	const featureGroupId = feature.featureGroup;
	if ( featureGroupId ) {
		const featureGroupTasks =
			normalized.featureGroups[ featureGroupId ]?.taskMapping?.[ issueType ];
		if ( featureGroupTasks ) {
			sourcedFeatureGroupTasks = featureGroupTasks.map(
				makeTaskSourcer( featureGroupId, 'featureGroup' )
			);
		}
	}

	const productId = getProductIdForFeature( normalized, featureId );
	if ( productId ) {
		const productTasks = normalized.products[ productId ]?.taskMapping?.[ issueType ];
		if ( productTasks ) {
			sourcedProductTasks = productTasks.map( makeTaskSourcer( productId, 'product' ) );
		}
	}

	return collapseTasks( sourcedFeatureTasks, sourcedFeatureGroupTasks, sourcedProductTasks );
}

function getProductIdForFeature(
	normalized: NormalizedReportingConfig,
	featureId: string
): string | undefined {
	const feature = normalized.features[ featureId ];
	if ( ! feature ) {
		return undefined;
	}

	const featureGroupId = feature.featureGroup;
	if ( featureGroupId ) {
		const featureGroup = normalized.featureGroups[ featureGroupId ];
		if ( featureGroup ) {
			return featureGroup.product;
		}
	}

	return feature.product;
}

function makeTaskSourcer( sourceId: string, sourceType: EntityType ) {
	return ( task: Task ) => {
		return {
			details: task,
			sourceId: sourceId,
			sourceType: sourceType,
		};
	};
}

function collapseTasks(
	featureTasks: SourcedTask[],
	featureGroupTasks: SourcedTask[],
	productTasks: SourcedTask[]
): SourcedTask[] {
	const finalTaskList: SourcedTask[] = [];
	const existingTaskDetails = new Set< string >();
	const existingGitHubRepos = new Set< string >();

	const addIfNotDuplicate = ( task: SourcedTask ) => {
		const taskDetails = JSON.stringify( task.details );
		if ( existingTaskDetails.has( taskDetails ) ) {
			return;
		}

		// If an existing task already has a GitHub-repo-specific task, we respect that.
		// Put another way, a feature-level GitHub task will override a product-level GitHub task
		if ( task.details.link?.type === 'github' ) {
			if ( existingGitHubRepos.has( task.details.link.repository ) ) {
				return;
			}
			existingTaskDetails.add( task.details.link.repository );
		}

		existingTaskDetails.add( taskDetails );
		finalTaskList.push( task );
	};

	// Feature overrides feature group which overrides product.
	// So we add them from most important to least, and skip duplicates.
	for ( const featureTask of featureTasks ) {
		addIfNotDuplicate( featureTask );
	}

	for ( const featureGroupTask of featureGroupTasks ) {
		addIfNotDuplicate( featureGroupTask );
	}

	for ( const productTask of productTasks ) {
		addIfNotDuplicate( productTask );
	}

	return finalTaskList;
}
