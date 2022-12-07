import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { ApiClient, ReportingConfigApiResponse } from '../api';
import {
	IndexedReportingConfig,
	NormalizedReportingConfig,
	Product,
	ReportingConfigState,
	TaskDetails,
	TaskParentEntityType,
	SearchMatch,
	ReportingConfigSearchResults,
} from './types';
import { indexReportingConfig, normalizeReportingConfig } from './reporting-config-parsers';
import { includesIgnoringCase } from '../common';

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
	searchTerm: '',
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
	reducers: {
		setReportingConfigSearchTerm( state, action: PayloadAction< string > ) {
			return {
				...state,
				searchTerm: action.payload,
			};
		},
	},
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
					...state,
					normalized: normalizeReportingConfig( payload ),
					indexed: indexReportingConfig( payload ),
					status: 'loaded',
					error: null,
				};
			} );
	},
} );

export const reportingConfigReducer = reportingConfigSlice.reducer;

export const { setReportingConfigSearchTerm } = reportingConfigSlice.actions;

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

export function selectReportingConfigSearchTerm( state: RootState ) {
	return state.reportingConfig.searchTerm;
}

export function selectRelevantTaskIds( state: RootState ): string[] {
	const { issueDetails, reportingConfig } = state;
	const { featureId, issueType } = issueDetails;
	const { normalized } = reportingConfig;

	if ( featureId === null || issueType === 'unset' ) {
		return [];
	}

	const relevantTasksIds: string[] = [];

	const feature = normalized.features[ featureId ];
	const featureTaskIds = feature?.taskMapping?.[ issueType ];
	if ( featureTaskIds ) {
		relevantTasksIds.push( ...featureTaskIds );
	}

	if ( feature.parentType === 'featureGroup' ) {
		const featureGroup = normalized.featureGroups[ feature.parentId ];
		const featureGroupTaskIds = featureGroup.taskMapping?.[ issueType ];
		if ( featureGroupTaskIds ) {
			relevantTasksIds.push( ...featureGroupTaskIds );
		}
	}

	let product: Product;
	if ( feature.parentType === 'featureGroup' ) {
		const featureGroup = normalized.featureGroups[ feature.parentId ];
		product = normalized.products[ featureGroup.productId ];
	} else {
		// The feature is directly under a product
		product = normalized.products[ feature.parentId ];
	}

	const productTaskIds = product.taskMapping?.[ issueType ];
	if ( productTaskIds ) {
		relevantTasksIds.push( ...productTaskIds );
	}

	return deduplicateTasksIds( state, relevantTasksIds );
}

// As we collect tasks across several layers, we need to make sure there's not duplicate task content.
function deduplicateTasksIds( state: RootState, taskIds: string[] ): string[] {
	const { tasks } = state.reportingConfig.normalized;
	const existingTaskDetails = new Set< string >();
	const existingGitHubRepos = new Set< string >();
	const finalTaskIds: string[] = [];
	const addIfNotDuplicate = ( taskId: string ) => {
		const task = tasks[ taskId ];
		const taskDetails: TaskDetails = { title: task.title, details: task.details, link: task.link };
		const stringifiedDetails = JSON.stringify( taskDetails );
		if ( existingTaskDetails.has( stringifiedDetails ) ) {
			return;
		}

		// If an existing task already has a GitHub-repo-specific task, we respect that.
		// Put another way, a feature-level GitHub task will override a product-level GitHub task
		if ( taskDetails.link?.type === 'github' ) {
			const gitHubRepo = taskDetails.link.repository;
			if ( existingGitHubRepos.has( gitHubRepo ) ) {
				return;
			}
			existingGitHubRepos.add( gitHubRepo );
		}

		existingTaskDetails.add( stringifiedDetails );
		finalTaskIds.push( taskId );
	};

	const makeParentTypeFilter = ( parentType: TaskParentEntityType ) => ( taskId: string ) =>
		tasks[ taskId ].parentType === parentType;
	const featureTaskIds = taskIds.filter( makeParentTypeFilter( 'feature' ) );
	const featureGroupTaskIds = taskIds.filter( makeParentTypeFilter( 'featureGroup' ) );
	const productTaskIds = taskIds.filter( makeParentTypeFilter( 'product' ) );

	// Feature overrides feature group which overrides product.
	// So we add them from most important parent type to least, and skip duplicates.
	for ( const featureTaskId of featureTaskIds ) {
		addIfNotDuplicate( featureTaskId );
	}

	for ( const featureGroupTaskId of featureGroupTaskIds ) {
		addIfNotDuplicate( featureGroupTaskId );
	}

	for ( const productTaskId of productTaskIds ) {
		addIfNotDuplicate( productTaskId );
	}

	return finalTaskIds;
}

export const selectReportingConfigSearchResults = createSelector(
	[ selectReportingConfigSearchTerm, selectNormalizedReportingConfig ],
	( searchTerm, reportingConfig ) => {
		const { features, featureGroups, products } = reportingConfig;
		const searchResults: ReportingConfigSearchResults = {
			products: new Set< string >(),
			featureGroups: new Set< string >(),
			features: new Set< string >(),
		};

		if ( ! searchTerm ) {
			return searchResults;
		}

		for ( const productId in products ) {
			const product = products[ productId ];
			if ( includesIgnoringCase( product.name, searchTerm ) ) {
				searchResults.products.add( productId );
			}
		}

		for ( const featureGroupId in featureGroups ) {
			const featureGroup = featureGroups[ featureGroupId ];
			if ( includesIgnoringCase( featureGroup.name, searchTerm ) ) {
				searchResults.featureGroups.add( featureGroupId );
				searchResults.products.add( featureGroup.productId );
			}
		}

		for ( const featureId in features ) {
			const feature = features[ featureId ];
			const keywordsIncludeSearchTerm = () =>
				feature.keywords?.some( ( keyword ) => includesIgnoringCase( keyword, searchTerm ) );

			if ( includesIgnoringCase( feature.name, searchTerm ) || keywordsIncludeSearchTerm() ) {
				searchResults.features.add( featureId );

				const feature = features[ featureId ];
				if ( feature.parentType === 'product' ) {
					searchResults.products.add( feature.parentId );
				} else {
					searchResults.featureGroups.add( feature.parentId );
					const parentFeatureGroup = featureGroups[ feature.parentId ];
					searchResults.products.add( parentFeatureGroup.productId );
				}
			}
		}

		return searchResults;
	}
);
