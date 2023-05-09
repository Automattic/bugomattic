import { selectTaskIdsForIssueDetails, selectReposForFeature } from '../relevant-task-ids';
import { NormalizedReportingConfig, TaskDetails } from '../../static-data/reporting-config/types';
import { createFakeRootState } from '../../test-utils/fake-root-state';

describe( '[selectTaskIdsForIssueDetails]', () => {
	test( 'Returns empty array if there is no feature id in the state', () => {
		const normalized: NormalizedReportingConfig = {
			tasks: {
				feature_task: {
					id: 'feature_task',
					parentType: 'feature',
					parentId: 'feature_id',
					details: 'Task instructions',
				},
			},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					featureGroupIds: [],
					featureIds: [ 'feature_id' ],
				},
			},
			featureGroups: {},
			features: {
				feature_id: {
					id: 'feature_id',
					name: 'Feature',
					parentType: 'product',
					parentId: 'product_id',
					taskMapping: {
						bug: [ 'feature_task' ],
						featureRequest: [],
						urgent: [],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized: normalized,
				indexed: {},
				loadError: null,
			},
			issueDetails: {
				issueType: 'bug',
				featureId: null,
				issueTitle: '',
			},
		} );

		const output = selectTaskIdsForIssueDetails( state );
		expect( output ).toEqual( [] );
	} );

	test( 'Returns empty array if the issue type is "unset"', () => {
		const normalized: NormalizedReportingConfig = {
			tasks: {
				feature_task: {
					id: 'feature_task',
					parentType: 'feature',
					parentId: 'feature_id',
					details: 'Task instructions',
				},
			},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					featureGroupIds: [],
					featureIds: [ 'feature_id' ],
				},
			},
			featureGroups: {},
			features: {
				feature_id: {
					id: 'feature_id',
					name: 'Feature',
					parentType: 'product',
					parentId: 'product_id',
					taskMapping: {
						bug: [ 'feature_task' ],
						featureRequest: [],
						urgent: [],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized: normalized,
				indexed: {},
				loadError: null,
			},
			issueDetails: {
				issueType: 'unset',
				featureId: 'feature_id',
				issueTitle: '',
			},
		} );

		const output = selectTaskIdsForIssueDetails( state );
		expect( output ).toEqual( [] );
	} );

	test( 'Returns tasks from all three levels in order of feature, feature group, product', () => {
		const featureId = 'feature_id';
		const firstFeatureTaskId = 'feature_task_1';
		const secondFeatureTaskId = 'feature_task_2';
		const featureGroupTaskId = 'feature_group_task';
		const productTaskId = 'product_task';

		const normalized: NormalizedReportingConfig = {
			tasks: {
				[ firstFeatureTaskId ]: {
					id: firstFeatureTaskId,
					details: 'First feature task',
					parentType: 'feature',
					parentId: featureId,
				},
				[ secondFeatureTaskId ]: {
					id: secondFeatureTaskId,
					details: 'Second feature task',
					parentType: 'feature',
					parentId: featureId,
				},
				[ featureGroupTaskId ]: {
					id: featureGroupTaskId,
					details: 'Feature group task',
					parentType: 'featureGroup',
					parentId: 'feature_group_id',
				},
				[ productTaskId ]: {
					id: productTaskId,
					details: 'Product task',
					parentType: 'product',
					parentId: 'product_id',
				},
			},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					taskMapping: {
						bug: [ productTaskId ],
						featureRequest: [],
						urgent: [],
					},
					featureGroupIds: [ 'feature_group_id' ],
					featureIds: [ featureId ],
				},
			},
			featureGroups: {
				feature_group_id: {
					id: 'feature_group_id',
					name: 'Feature Group',
					productId: 'product_id',
					taskMapping: {
						bug: [ featureGroupTaskId ],
						featureRequest: [],
						urgent: [],
					},
					featureIds: [ featureId ],
				},
			},
			features: {
				[ featureId ]: {
					id: featureId,
					name: 'Feature',
					parentType: 'featureGroup',
					parentId: 'feature_group_id',
					taskMapping: {
						bug: [ firstFeatureTaskId, secondFeatureTaskId ],
						featureRequest: [],
						urgent: [],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized: normalized,
				indexed: {},
				loadError: null,
			},
			issueDetails: {
				issueType: 'bug',
				featureId: featureId,
				issueTitle: '',
			},
		} );

		const output = selectTaskIdsForIssueDetails( state );
		expect( output ).toEqual( [
			firstFeatureTaskId,
			secondFeatureTaskId,
			featureGroupTaskId,
			productTaskId,
		] );
	} );

	test( 'Removes tasks that have duplicate details, prioritizing feature-level tasks', () => {
		const duplicateTaskDetails: TaskDetails = {
			title: 'Duplicate title',
			details: 'Duplicate instructions',
			link: {
				type: 'slack',
				channel: 'fake-channel',
			},
		};

		const featureId = 'feature_id';
		const featureTaskId = 'feature_task_id';

		const normalized: NormalizedReportingConfig = {
			tasks: {
				[ featureTaskId ]: {
					id: featureTaskId,
					parentType: 'feature',
					parentId: featureId,
					...duplicateTaskDetails,
				},
				feature_group_task: {
					id: 'feature_group_task',
					parentType: 'featureGroup',
					parentId: 'feature_group_id',
					...duplicateTaskDetails,
				},
				product_task: {
					id: 'product_task',
					parentType: 'product',
					parentId: 'product_id',
					...duplicateTaskDetails,
				},
			},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					taskMapping: {
						bug: [],
						featureRequest: [ 'product_task' ],
						urgent: [],
					},
					featureGroupIds: [ 'feature_group_id' ],
					featureIds: [ featureId ],
				},
			},
			featureGroups: {
				feature_group_id: {
					id: 'feature_group_id',
					name: 'Feature Group',
					productId: 'product_id',
					taskMapping: {
						bug: [],
						featureRequest: [ 'feature_group_task' ],
						urgent: [],
					},
					featureIds: [ featureId ],
				},
			},
			features: {
				[ featureId ]: {
					id: featureId,
					name: 'Feature',
					parentType: 'featureGroup',
					parentId: 'feature_group_id',
					taskMapping: {
						bug: [],
						featureRequest: [ featureTaskId ],
						urgent: [],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized: normalized,
				indexed: {},
				loadError: null,
			},
			issueDetails: {
				issueType: 'featureRequest',
				featureId: featureId,
				issueTitle: '',
			},
		} );

		const output = selectTaskIdsForIssueDetails( state );
		expect( output ).toEqual( [ featureTaskId ] );
	} );

	test( 'Removes tasks that point to the same GitHub repo, prioritizing feature-level tasks', () => {
		const featureId = 'feature_id';
		const featureTaskId = 'feature_task_id';
		const duplicateRepo = 'FakeOrg/fake-repo';

		const normalized: NormalizedReportingConfig = {
			tasks: {
				[ featureTaskId ]: {
					id: featureTaskId,
					parentType: 'feature',
					parentId: featureId,
					details: 'Feature GitHub task',
					link: {
						type: 'github',
						labels: [ 'priority-label' ],
						repository: duplicateRepo,
					},
				},
				product_task: {
					id: 'product_task',
					parentType: 'product',
					parentId: 'product_id',
					details: 'Product GitHub task',
					link: {
						type: 'github',
						labels: [ 'other-label' ],
						repository: duplicateRepo,
					},
				},
			},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					taskMapping: {
						bug: [],
						featureRequest: [],
						urgent: [ 'product_task' ],
					},
					featureGroupIds: [],
					featureIds: [ featureId ],
				},
			},
			featureGroups: {},
			features: {
				[ featureId ]: {
					id: featureId,
					name: 'Feature',
					parentType: 'product',
					parentId: 'product_id',
					taskMapping: {
						bug: [],
						featureRequest: [],
						urgent: [ featureTaskId ],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized: normalized,
				indexed: {},
				loadError: null,
			},
			issueDetails: {
				issueType: 'urgent',
				featureId: featureId,
				issueTitle: '',
			},
		} );

		const output = selectTaskIdsForIssueDetails( state );
		expect( output ).toEqual( [ featureTaskId ] );
	} );
} );

describe( '[selectReposForFeature]', () => {
	const featureId = 'feature_id';

	test( 'Returns empty array if feature has no tasks', () => {
		const normalized: NormalizedReportingConfig = {
			tasks: {},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					featureGroupIds: [],
					featureIds: [ featureId ],
				},
			},
			featureGroups: {},
			features: {
				feature_id: {
					id: featureId,
					name: 'Feature',
					parentType: 'product',
					parentId: 'product_id',
					taskMapping: {
						bug: [],
						featureRequest: [],
						urgent: [],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized,
				indexed: {},
				loadError: null,
			},

			issueDetails: {
				issueType: 'urgent',
				featureId: featureId,
				issueTitle: '',
			},
			featureSelectorForm: {
				searchTerm: '',
				selectedFeatureId: featureId,
			},
		} );

		const output = selectReposForFeature( state );
		expect( output ).toEqual( [] );
	} );

	test( 'Return empty array if feature has no GitHub tasks', () => {
		const normalized: NormalizedReportingConfig = {
			tasks: {
				feature_task: {
					id: 'feature_task',
					parentType: 'feature',
					parentId: featureId,
					details: 'Task instructions',
				},
			},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					featureGroupIds: [],
					featureIds: [ featureId ],
				},
			},
			featureGroups: {},
			features: {
				feature_id: {
					id: featureId,
					name: 'Feature',
					parentType: 'product',
					parentId: 'product_id',
					taskMapping: {
						bug: [],
						featureRequest: [],
						urgent: [],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized,
				indexed: {},
				loadError: null,
			},
			issueDetails: {
				issueType: 'urgent',
				featureId: featureId,
				issueTitle: '',
			},
			featureSelectorForm: {
				searchTerm: '',
				selectedFeatureId: featureId,
			},
		} );

		const output = selectReposForFeature( state );
		expect( output ).toEqual( [] );
	} );

	test( 'Returns the repos for a given feature ID', () => {
		const featureId = 'feature_id';
		const featureTaskId = 'feature_task_id';
		const repo = 'FakeOrg/fake-repo';

		const normalized: NormalizedReportingConfig = {
			tasks: {
				[ featureTaskId ]: {
					id: featureTaskId,
					parentType: 'feature',
					parentId: featureId,
					details: 'Feature GitHub task',
					link: {
						type: 'github',
						labels: [ 'priority-label' ],
						repository: repo,
					},
				},
				product_task: {
					id: 'product_task',
					parentType: 'product',
					parentId: 'product_id',
					details: 'Product GitHub task',
					link: {
						type: 'github',
						labels: [ 'other-label' ],
						repository: repo,
					},
				},
			},
			products: {
				product_id: {
					id: 'product_id',
					name: 'Product',
					taskMapping: {
						bug: [],
						featureRequest: [],
						urgent: [ 'product_task' ],
					},
					featureGroupIds: [],
					featureIds: [ featureId ],
				},
			},
			featureGroups: {},
			features: {
				[ featureId ]: {
					id: featureId,
					name: 'Feature',
					parentType: 'product',
					parentId: 'product_id',
					taskMapping: {
						bug: [],
						featureRequest: [],
						urgent: [ featureTaskId ],
					},
				},
			},
		};

		const state = createFakeRootState( {
			reportingConfig: {
				normalized: normalized,
				indexed: {},
				loadError: null,
			},
			issueDetails: {
				issueType: 'bug',
				featureId: featureId,
				issueTitle: '',
			},
			featureSelectorForm: {
				searchTerm: '',
				selectedFeatureId: featureId,
			},
		} );

		const output = selectReposForFeature( state );
		expect( output ).toEqual( [ repo ] );
	} );
} );
