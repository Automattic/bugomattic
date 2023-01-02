import { createSelector } from '@reduxjs/toolkit';
import { IssueDetails } from '../issue-details';
import { selectIssueDetails } from '../issue-details/issue-details-slice';
import { selectNormalizedReportingConfig } from '../reporting-config/reporting-config-slice';
import {
	NormalizedReportingConfig,
	Product,
	TaskDetails,
	TaskParentEntityType,
	Tasks,
} from '../reporting-config/types';

// The "createSelector" function lets you memo-ize potentially expensive selectors:
// https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization
export const selectRelevantTaskIds = createSelector(
	[ selectIssueDetails, selectNormalizedReportingConfig ],
	( issueDetails, reportingConfig ) => {
		return getRelevantTaskIds( issueDetails, reportingConfig );
	}
);

function getRelevantTaskIds(
	issueDetails: IssueDetails,
	reportingConfig: NormalizedReportingConfig
): string[] {
	const { featureId, issueType } = issueDetails;
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
