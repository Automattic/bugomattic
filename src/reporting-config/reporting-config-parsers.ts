import { ApiFeatureGroups, ApiFeatures, ApiTasks, ReportingConfigApiResponse } from '../api/types';
import {
	FeatureGroups,
	FeatureParentEntityType,
	Features,
	IndexedReportingConfig,
	NormalizedReportingConfig,
	Products,
	TaskMapping,
	TaskParentEntityType,
	Tasks,
} from './types';

// Defining all the core logic for how we normalize and index reporting configs here.
// We are keeping this separate from how this logic is used in reducers and thunks.
// This allows easy unit testing of this critical logic apart from how its consumed.

export function normalizeReportingConfig(
	apiResponse: ReportingConfigApiResponse
): NormalizedReportingConfig {
	if ( ! isValidDictionary( apiResponse ) ) {
		throwReportingConfigError( 'Invalid root reporting config dictionary' );
	}

	let normalizedTasks: Tasks = {};
	let normalizedFeatures: Features = {};
	let normalizedFeatureGroups: FeatureGroups = {};
	const normalizedProducts: Products = {};

	for ( const productName in apiResponse ) {
		const productDetails = apiResponse[ productName ];
		if ( ! isValidDictionary( productDetails ) ) {
			throwReportingConfigError( `Invalid product "${ productName }"` );
		}

		const { featureGroups, features, description, learnMoreLinks, tasks } =
			apiResponse[ productName ];
		const productId = productName; // We can use name as ID, as being top level, they are unique.

		let productTaskMapping: TaskMapping | undefined;
		if ( tasks ) {
			const taskOutput = normalizeTasks( tasks, {
				parentType: 'product',
				parentId: productId,
			} );
			normalizedTasks = {
				...normalizedTasks,
				...taskOutput.normalizedTasks,
			};
			productTaskMapping = taskOutput.taskMapping;
		}

		let featureGroupIds: string[] = [];
		if ( featureGroups ) {
			const featureGroupOutput = normalizeFeatureGroups( featureGroups, { productId: productId } );
			normalizedTasks = {
				...normalizedTasks,
				...featureGroupOutput.normalizedTasks,
			};
			normalizedFeatures = {
				...normalizedFeatures,
				...featureGroupOutput.normalizedFeatures,
			};
			normalizedFeatureGroups = {
				...normalizedFeatureGroups,
				...featureGroupOutput.normalizedFeatureGroups,
			};

			featureGroupIds = Object.keys( featureGroupOutput.normalizedFeatureGroups );
		}

		let featureIds: string[] = [];
		if ( features ) {
			const featureOutput = normalizeFeatures( features, {
				parentType: 'product',
				parentId: productId,
			} );
			normalizedTasks = {
				...normalizedTasks,
				...featureOutput.normalizedTasks,
			};
			normalizedFeatures = {
				...normalizedFeatures,
				...featureOutput.normalizedFeatures,
			};

			featureIds = Object.keys( featureOutput.normalizedFeatures );
		}

		normalizedProducts[ productId ] = {
			id: productId,
			name: productName,
			description: description,
			learnMoreLinks: learnMoreLinks,
			taskMapping: productTaskMapping,
			featureGroupIds: featureGroupIds,
			featureIds: featureIds,
		};
	}

	return {
		tasks: normalizedTasks,
		features: normalizedFeatures,
		featureGroups: normalizedFeatureGroups,
		products: normalizedProducts,
	};
}

interface FeatureGroupContext {
	productId: string;
}

interface NormalizedFeatureGroupOutput {
	normalizedTasks: Tasks;
	normalizedFeatures: Features;
	normalizedFeatureGroups: FeatureGroups;
}

function normalizeFeatureGroups(
	apiFeatureGroups: ApiFeatureGroups,
	context: FeatureGroupContext
): NormalizedFeatureGroupOutput {
	if ( ! isValidDictionary( apiFeatureGroups ) ) {
		throwReportingConfigError( `Invalid feature groups (for product "${ context.productId }")` );
	}
	let normalizedTasks: Tasks = {};
	let normalizedFeatures: Features = {};
	const normalizedFeatureGroups: FeatureGroups = {};

	for ( const featureGroupName in apiFeatureGroups ) {
		const featureGroupDetails = apiFeatureGroups[ featureGroupName ];
		if ( ! isValidDictionary( featureGroupDetails ) || ! featureGroupDetails.features ) {
			throwReportingConfigError(
				`Invalid feature group "${ featureGroupName }" (for product "${ context.productId }")`
			);
		}
		const { features, description, learnMoreLinks, tasks } = featureGroupDetails;
		const featureGroupId = `${ context.productId }__${ featureGroupName }`;

		let featureGroupTaskMapping: TaskMapping | undefined;

		if ( tasks ) {
			const taskOutput = normalizeTasks( tasks, {
				parentId: featureGroupId,
				parentType: 'featureGroup',
			} );
			normalizedTasks = {
				...normalizedTasks,
				...taskOutput.normalizedTasks,
			};
			featureGroupTaskMapping = taskOutput.taskMapping;
		}

		const featureOutput = normalizeFeatures( features, {
			parentType: 'featureGroup',
			parentId: featureGroupId,
		} );
		normalizedFeatures = {
			...normalizedFeatures,
			...featureOutput.normalizedFeatures,
		};
		normalizedTasks = {
			...normalizedTasks,
			...featureOutput.normalizedTasks,
		};

		const featureIds = Object.keys( featureOutput.normalizedFeatures );

		normalizedFeatureGroups[ featureGroupId ] = {
			id: featureGroupId,
			name: featureGroupName,
			description: description,
			learnMoreLinks: learnMoreLinks,
			taskMapping: featureGroupTaskMapping,
			productId: context.productId,
			featureIds: featureIds,
		};
	}

	return {
		normalizedTasks,
		normalizedFeatures,
		normalizedFeatureGroups,
	};
}

interface FeatureContext {
	parentType: FeatureParentEntityType;
	parentId: string;
}

interface NormalizedFeatureOutput {
	normalizedTasks: Tasks;
	normalizedFeatures: Features;
}

function normalizeFeatures(
	apiFeatures: ApiFeatures,
	context: FeatureContext
): NormalizedFeatureOutput {
	if ( ! isValidDictionary( apiFeatures ) ) {
		throwReportingConfigError(
			`Invalid features (for ${ context.parentType } "${ context.parentId }")`
		);
	}

	let normalizedTasks: Tasks = {};
	const normalizedFeatures: Features = {};
	for ( const featureName in apiFeatures ) {
		const featureDetails = apiFeatures[ featureName ];
		if ( ! isValidDictionary( featureDetails ) ) {
			throwReportingConfigError(
				`Invalid feature "${ featureName }" (for ${ context.parentType } "${ context.parentId }")`
			);
		}
		const { description, keywords, learnMoreLinks, tasks } = featureDetails;
		const featureId = `${ context.parentId }__${ featureName }`;

		let featureTaskMapping: TaskMapping | undefined;

		if ( tasks ) {
			const taskOutput = normalizeTasks( tasks, {
				parentId: featureId,
				parentType: 'feature',
			} );
			normalizedTasks = {
				...normalizedTasks,
				...taskOutput.normalizedTasks,
			};
			featureTaskMapping = taskOutput.taskMapping;
		}

		normalizedFeatures[ featureId ] = {
			id: featureId,
			name: featureName,
			description: description,
			keywords: keywords,
			learnMoreLinks: learnMoreLinks,
			taskMapping: featureTaskMapping,
			parentType: context.parentType,
			parentId: context.parentId,
		};
	}

	return {
		normalizedTasks,
		normalizedFeatures,
	};
}

interface TaskContext {
	parentType: TaskParentEntityType;
	parentId: string;
}

interface NormalizedTaskOutput {
	normalizedTasks: Tasks;
	taskMapping: TaskMapping;
}

function normalizeTasks( apiTasks: ApiTasks, context: TaskContext ): NormalizedTaskOutput {
	if ( ! isValidDictionary( apiTasks ) ) {
		throwReportingConfigError(
			`Invalid tasks (for ${ context.parentType } "${ context.parentId }")`
		);
	}

	const taskMapping: TaskMapping = {
		bug: [],
		urgent: [],
		featureRequest: [],
	};
	const normalizedTasks: Tasks = {};

	const issueTypes = [ 'bug', 'featureRequest', 'urgent' ] as const;
	issueTypes.forEach( ( issueType ) => {
		const tasksForType = apiTasks[ issueType ];
		if ( ! Array.isArray( tasksForType ) ) {
			throwReportingConfigError(
				`Invalid ${ issueType } tasks (for ${ context.parentType } "${ context.parentId }")`
			);
		}

		tasksForType.forEach( ( taskDetails, index ) => {
			if ( ! isValidDictionary( taskDetails ) ) {
				throwReportingConfigError(
					`Invalid ${ issueType } task at index ${ index } (for ${ context.parentType } "${ context.parentId }")`
				);
			}
			const taskId = `${ context.parentId }__${ issueType }__${ index }`;
			normalizedTasks[ taskId ] = {
				title: taskDetails.title,
				details: taskDetails.details,
				link: taskDetails.link,
				id: taskId,
				parentType: context.parentType,
				parentId: context.parentId,
			};
			taskMapping[ issueType ].push( taskId );
		} );
	} );

	return { normalizedTasks, taskMapping };
}

function isValidDictionary( object: unknown ): boolean {
	return object !== null && typeof object === 'object' && ! Array.isArray( object );
}

function throwReportingConfigError( message: string ): never {
	throw new Error( `Invalid reporting config: ${ message }` );
}

export function indexReportingConfig(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_response: ReportingConfigApiResponse
): IndexedReportingConfig {
	// TODO: create real implementation once we know the indices we need!

	return {
		foo: 'bar',
	};
}
