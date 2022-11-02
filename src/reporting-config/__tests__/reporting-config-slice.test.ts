/* eslint-disable @typescript-eslint/no-explicit-any */
// ^^ We don't care about parts of the state tree,
// so being able to use "any" to stub out those parts is helpful here.
import { RootState } from '../../app';
import { selectRelevantTaskIds } from '../reporting-config-slice';
import { NormalizedReportingConfig, TaskDetails } from '../types';

describe( '[reporting-config-slice]', () => {
	describe( '[selectRelevantTaskIds]', () => {
		test( 'Returns empty array if there is no feature id in the state', () => {
			const normalized: NormalizedReportingConfig = {
				tasks: {
					feature_task: {
						id: 'feature_task',
						parentType: 'feature',
						parentId: 'feature_id',
						instructions: 'Task instructions',
					},
				},
				products: {
					product_id: {
						id: 'product_id',
						name: 'Product',
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
							blocker: [],
						},
					},
				},
			};

			const state: RootState = {
				completedTasks: [],
				reportingConfig: {
					normalized: normalized,
					indexed: {} as any,
					status: 'loaded',
					error: null,
				},
				issueDetails: {
					issueType: 'bug',
					featureId: null,
				},
			};

			const output = selectRelevantTaskIds( state );
			expect( output ).toEqual( [] );
		} );

		test( 'Returns empty array if the issue type is "unset"', () => {
			const normalized: NormalizedReportingConfig = {
				tasks: {
					feature_task: {
						id: 'feature_task',
						parentType: 'feature',
						parentId: 'feature_id',
						instructions: 'Task instructions',
					},
				},
				products: {
					product_id: {
						id: 'product_id',
						name: 'Product',
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
							blocker: [],
						},
					},
				},
			};

			const state: RootState = {
				completedTasks: [],
				reportingConfig: {
					normalized: normalized,
					indexed: {} as any,
					status: 'loaded',
					error: null,
				},
				issueDetails: {
					issueType: 'unset',
					featureId: 'feature_id',
				},
			};

			const output = selectRelevantTaskIds( state );
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
						instructions: 'First feature task',
						parentType: 'feature',
						parentId: featureId,
					},
					[ secondFeatureTaskId ]: {
						id: secondFeatureTaskId,
						instructions: 'Second feature task',
						parentType: 'feature',
						parentId: featureId,
					},
					[ featureGroupTaskId ]: {
						id: featureGroupTaskId,
						instructions: 'Feature group task',
						parentType: 'featureGroup',
						parentId: 'feature_group_id',
					},
					[ productTaskId ]: {
						id: productTaskId,
						instructions: 'Product task',
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
							blocker: [],
						},
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
							blocker: [],
						},
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
							blocker: [],
						},
					},
				},
			};

			const state: RootState = {
				completedTasks: [],
				reportingConfig: {
					normalized: normalized,
					indexed: {} as any,
					status: 'loaded',
					error: null,
				},
				issueDetails: {
					issueType: 'bug',
					featureId: featureId,
				},
			};

			const output = selectRelevantTaskIds( state );
			expect( output ).toEqual( [
				firstFeatureTaskId,
				secondFeatureTaskId,
				featureGroupTaskId,
				productTaskId,
			] );
		} );

		test( 'Removes tasks that have duplicate details, prioritizing feature-level tasks', () => {
			const duplicateTaskDetails: TaskDetails = {
				instructions: 'Duplicate instructions',
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
							blocker: [],
						},
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
							blocker: [],
						},
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
							blocker: [],
						},
					},
				},
			};

			const state: RootState = {
				completedTasks: [],
				reportingConfig: {
					normalized: normalized,
					indexed: {} as any,
					status: 'loaded',
					error: null,
				},
				issueDetails: {
					issueType: 'featureRequest',
					featureId: featureId,
				},
			};

			const output = selectRelevantTaskIds( state );
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
						instructions: 'Feature GitHub task',
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
						instructions: 'Product GitHub task',
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
							blocker: [ 'product_task' ],
						},
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
							blocker: [ featureTaskId ],
						},
					},
				},
			};

			const state: RootState = {
				completedTasks: [],
				reportingConfig: {
					normalized: normalized,
					indexed: {} as any,
					status: 'loaded',
					error: null,
				},
				issueDetails: {
					issueType: 'blocker',
					featureId: featureId,
				},
			};

			const output = selectRelevantTaskIds( state );
			expect( output ).toEqual( [ featureTaskId ] );
		} );
	} );
} );
