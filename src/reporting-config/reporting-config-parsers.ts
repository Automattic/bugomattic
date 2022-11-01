import { ApiTasks, ReportingConfigApiResponse } from '../api';
import {
	IndexedReportingConfig,
	NormalizedReportingConfig,
	TaskMapping,
	TaskParentEntityType,
	Tasks,
} from './types';

// Defining all the core logic for how we normalize and index reporting configs here.
// We are keeping this separate from how this logic is used in reducers and thunks.
// This allows easy unit testing of this critical logic apart from how its consumed.

export function normalizeReportingConfig(
	response: ReportingConfigApiResponse
): NormalizedReportingConfig {
	const normalizedReportingConfig: NormalizedReportingConfig = {
		features: {},
		featureGroups: {},
		products: {},
		tasks: {},
	};

	for ( const productName in response ) {
		const { featureGroups, features, description, learnMoreLinks, tasks } = response[ productName ];
		const productId = productName; // We can use name as ID, as being top level, they are unique.

		let productTaskMapping: TaskMapping | undefined;
		if ( tasks ) {
			const { normalizedTasks, taskMapping } = normalizeTasks( tasks, {
				parentId: productId,
				parentType: 'product',
			} );
			normalizedReportingConfig.tasks = {
				...normalizedReportingConfig.tasks,
				...normalizedTasks,
			};
			productTaskMapping = taskMapping;
		}

		normalizedReportingConfig.products[ productId ] = {
			id: productId,
			name: productName,
			description: description,
			learnMoreLinks: learnMoreLinks,
			taskMapping: productTaskMapping,
		};

		if ( featureGroups ) {
			for ( const featureGroupName in featureGroups ) {
				const { features, description, learnMoreLinks, tasks } = featureGroups[ featureGroupName ];
				const featureGroupId = `${ productName }__${ featureGroupName }`;

				let featureGroupTaskMapping: TaskMapping | undefined;

				if ( tasks ) {
					const { normalizedTasks, taskMapping } = normalizeTasks( tasks, {
						parentId: featureGroupId,
						parentType: 'featureGroup',
					} );
					normalizedReportingConfig.tasks = {
						...normalizedReportingConfig.tasks,
						...normalizedTasks,
					};
					featureGroupTaskMapping = taskMapping;
				}

				normalizedReportingConfig.featureGroups[ featureGroupId ] = {
					id: featureGroupId,
					name: featureGroupName,
					description: description,
					learnMoreLinks: learnMoreLinks,
					taskMapping: featureGroupTaskMapping,
					productId: productId,
				};

				for ( const featureName in features ) {
					const { description, keywords, learnMoreLinks, tasks } = features[ featureName ];
					const featureId = `${ productName }__${ featureGroupName }__${ featureName }`;

					let featureTaskMapping: TaskMapping | undefined;

					if ( tasks ) {
						const { normalizedTasks, taskMapping } = normalizeTasks( tasks, {
							parentId: featureId,
							parentType: 'feature',
						} );
						normalizedReportingConfig.tasks = {
							...normalizedReportingConfig.tasks,
							...normalizedTasks,
						};
						featureTaskMapping = taskMapping;
					}

					normalizedReportingConfig.features[ featureId ] = {
						id: featureId,
						name: featureName,
						description: description,
						keywords: keywords,
						learnMoreLinks: learnMoreLinks,
						taskMapping: featureTaskMapping,
						parentType: 'featureGroup',
						parentId: featureGroupId,
					};
				}
			}
		}

		if ( features ) {
			for ( const featureName in features ) {
				const { description, keywords, learnMoreLinks, tasks } = features[ featureName ];
				const featureId = `${ productName }__${ featureName }`;

				let featureTaskMapping: TaskMapping | undefined;

				if ( tasks ) {
					const { normalizedTasks, taskMapping } = normalizeTasks( tasks, {
						parentId: featureId,
						parentType: 'feature',
					} );
					normalizedReportingConfig.tasks = {
						...normalizedReportingConfig.tasks,
						...normalizedTasks,
					};
					featureTaskMapping = taskMapping;
				}

				normalizedReportingConfig.features[ featureId ] = {
					id: featureId,
					name: featureName,
					description: description,
					keywords: keywords,
					learnMoreLinks: learnMoreLinks,
					taskMapping: featureTaskMapping,
					parentType: 'product',
					parentId: productId,
				};
			}
		}
	}

	return normalizedReportingConfig;
}

function normalizeTasks(
	apiTasks: ApiTasks,
	{ parentType, parentId }: { parentType: TaskParentEntityType; parentId: string }
): { normalizedTasks: Tasks; taskMapping: TaskMapping } {
	const taskMapping: TaskMapping = {
		bug: [],
		blocker: [],
		featureRequest: [],
	};
	const normalizedTasks: Tasks = {};

	const issueTypes = [ 'bug', 'featureRequest', 'blocker' ] as const;
	issueTypes.forEach( ( issueType ) => {
		apiTasks[ issueType ].forEach( ( taskDetails, index ) => {
			const taskId = `${ parentId }__${ issueType }__${ index }`;
			normalizedTasks[ taskId ] = {
				...taskDetails,
				parentType: parentType,
				parentId: parentId,
			};
			taskMapping[ issueType ].push( taskId );
		} );
	} );

	return { normalizedTasks, taskMapping };
}

export function indexReportingConfig(
	_response: ReportingConfigApiResponse
): IndexedReportingConfig {
	// TODO: create real implementation once we know the indices we need!

	return {
		foo: 'bar',
	};
}
