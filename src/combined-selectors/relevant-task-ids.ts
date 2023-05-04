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

export const selectTaskIdsForIssueDetails = createSelector(
	[ selectNormalizedReportingConfig, selectIssueDetails ],
	( reportingConfig, issueDetails ) => {
		const { featureId, issueType } = issueDetails;
		return getTaskIdsForFeatureAndType( reportingConfig, featureId, issueType );
	}
);

export const selectReposForFeature = createSelector(
	[ selectNormalizedReportingConfig, selectSelectedFeatureId ],
	( reportingConfig, featureId ) => {
		return getReposForFeature( reportingConfig, featureId );
	}
);

function getReposForFeature(
	reportingConfig: NormalizedReportingConfig,
	featureId: FeatureId
): string[] {
	const { tasks } = reportingConfig;
	const taskIds = getTaskIdsForFeature( reportingConfig, featureId );

	const repositories = new Set< string >();
	for ( const taskId of taskIds ) {
		const task = tasks[ taskId ];
		if ( task?.link?.type === 'github' && task.link.repository ) {
			repositories.add( task.link.repository );
		}
	}

	return Array.from( repositories );
}

function getTaskIdsForFeature(
	reportingConfig: NormalizedReportingConfig,
	featureId: FeatureId
): string[] {
	const { tasks } = reportingConfig;
	const allIssueTypes: IssueType[] = [ 'bug', 'featureRequest', 'urgent' ];
	const taskIds = allIssueTypes.flatMap( ( issueType ) =>
		getTaskIdsForFeatureAndType( reportingConfig, featureId, issueType )
	);

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
