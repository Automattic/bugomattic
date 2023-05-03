import { createSelector } from '@reduxjs/toolkit';
import { FeatureId, IssueType } from '../issue-details/types';
import { selectIssueDetails } from '../issue-details/issue-details-slice';
import { selectNormalizedReportingConfig } from '../static-data/reporting-config/reporting-config-slice';
import {
	NormalizedReportingConfig,
	Product,
	TaskDetails,
	TaskParentEntityType,
	Tasks,
} from '../static-data/reporting-config/types';
import { selectSelectedFeatureId } from '../feature-selector-form/feature-selector-form-slice';

// This one is for getting the task IDs for displaying in Next Steps
export const selectTaskIdsForCurrentIssueDetails = createSelector(
	[ selectNormalizedReportingConfig, selectIssueDetails ],
	( reportingConfig, issueDetails ) => {
		const { featureId, issueType } = issueDetails;
		return getTaskIdsForFeatureAndType( reportingConfig, featureId, issueType );
	}
);

// This one is for getting getting all the repos to display in the feature selector form.
export const selectAllReposForFormSelectedFeature = createSelector(
	[ selectNormalizedReportingConfig, selectSelectedFeatureId ],
	( reportingConfig, featureId ) => {
		return getAllReposForFeature( reportingConfig, featureId );
	}
);

// TODO: can delete -- just showing how we could then make a new selector if we wanted to show the repos for
// the final saved feature ID, like if we wanted to show the repos in  "More Info"
export const selectAllReposForCurrentIssueDetails = createSelector(
	[ selectNormalizedReportingConfig, selectIssueDetails ],
	( reportingConfig, issueDetails ) => {
		const { featureId } = issueDetails;
		return getAllReposForFeature( reportingConfig, featureId );
	}
);

// TODO: can delete -- showing an example of how we could make a selector that takes in the feature ID
// If we tracked the feature ID in local state instead of the redux store, this is how we could pass it in.
// In a component, this would look like...
// const fakeLocalFeatureId = 'local-feature';
// const reposForFeature = useAppSelector( ( state ) =>
// 	  selectAllReposForFeature( state, fakeLocalFeatureId )
// );
export const selectAllReposForFeature = createSelector(
	[ selectNormalizedReportingConfig, ( _, featureId: FeatureId ) => featureId ],
	( reportingConfig, featureId ) => {
		return getAllReposForFeature( reportingConfig, featureId );
	}
);

function getAllReposForFeature(
	reportingConfig: NormalizedReportingConfig,
	featureId: FeatureId
): string[] {
	const allTaskIds = getAllTaskIdsForFeature( reportingConfig, featureId );
	const { tasks } = reportingConfig;

	const repositories = new Set< string >();
	for ( const taskId of allTaskIds ) {
		const task = tasks[ taskId ];
		if ( task?.link?.type === 'github' && task.link.repository ) {
			repositories.add( task.link.repository );
		}
	}

	return Array.from( repositories );
}

function getAllTaskIdsForFeature(
	reportingConfig: NormalizedReportingConfig,
	featureId: FeatureId
): string[] {
	const { tasks } = reportingConfig;
	const taskIds = [
		...getTaskIdsForFeatureAndType( reportingConfig, featureId, 'bug' ),
		...getTaskIdsForFeatureAndType( reportingConfig, featureId, 'featureRequest' ),
		...getTaskIdsForFeatureAndType( reportingConfig, featureId, 'urgent' ),
	];

	return deduplicateTasksIds( tasks, taskIds );
}

function getTaskIdsForFeatureAndType(
	reportingConfig: NormalizedReportingConfig,
	featureId: FeatureId,
	issueType: IssueType
): string[] {
	const { products, featureGroups, features, tasks } = reportingConfig;

	if ( featureId === null || issueType === 'unset' ) {
		return [];
	}

	const relevantTasksIds: string[] = [];

	const feature = features[ featureId ];
	const featureTaskIds = feature?.taskMapping?.[ issueType ];
	if ( featureTaskIds ) {
		relevantTasksIds.push( ...featureTaskIds );
	}

	if ( feature.parentType === 'featureGroup' ) {
		const featureGroup = featureGroups[ feature.parentId ];
		const featureGroupTaskIds = featureGroup.taskMapping?.[ issueType ];
		if ( featureGroupTaskIds ) {
			relevantTasksIds.push( ...featureGroupTaskIds );
		}
	}

	let product: Product;
	if ( feature.parentType === 'featureGroup' ) {
		const featureGroup = featureGroups[ feature.parentId ];
		product = products[ featureGroup.productId ];
	} else {
		// The feature is directly under a product
		product = products[ feature.parentId ];
	}

	const productTaskIds = product.taskMapping?.[ issueType ];
	if ( productTaskIds ) {
		relevantTasksIds.push( ...productTaskIds );
	}

	return deduplicateTasksIds( tasks, relevantTasksIds );
}

// As we collect tasks across several layers, we need to make sure there's not duplicate task content.
function deduplicateTasksIds( taskDefinitions: Tasks, taskIds: string[] ): string[] {
	const existingTaskDetails = new Set< string >();
	const existingGitHubRepos = new Set< string >();
	const finalTaskIds: string[] = [];
	const addIfNotDuplicate = ( taskId: string ) => {
		const task = taskDefinitions[ taskId ];
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
		taskDefinitions[ taskId ].parentType === parentType;
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
