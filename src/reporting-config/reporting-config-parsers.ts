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
	let normalizedTasks: Tasks = {};
	let normalizedFeatures: Features = {};
	let normalizedFeatureGroups: FeatureGroups = {};
	const normalizedProducts: Products = {};

	for ( const productName in apiResponse ) {
		const productDetails = apiResponse[ productName ];
		if ( ! productDetails || typeof productDetails !== 'object' ) {
			throw new Error(
				`Invalid reporting config. Product "${ productName }" is not a valid product.`
			);
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
	let normalizedTasks: Tasks = {};
	let normalizedFeatures: Features = {};
	const normalizedFeatureGroups: FeatureGroups = {};

	for ( const featureGroupName in apiFeatureGroups ) {
		const { features, description, learnMoreLinks, tasks } = apiFeatureGroups[ featureGroupName ];
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
	let normalizedTasks: Tasks = {};
	const normalizedFeatures: Features = {};
	for ( const featureName in apiFeatures ) {
		const { description, keywords, learnMoreLinks, tasks } = apiFeatures[ featureName ];
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
	const taskMapping: TaskMapping = {
		bug: [],
		urgent: [],
		featureRequest: [],
	};
	const normalizedTasks: Tasks = {};

	const issueTypes = [ 'bug', 'featureRequest', 'urgent' ] as const;
	issueTypes.forEach( ( issueType ) => {
		apiTasks[ issueType ].forEach( ( taskDetails, index ) => {
			const taskId = `${ context.parentId }__${ issueType }__${ index }`;
			normalizedTasks[ taskId ] = {
				...taskDetails,
				id: taskId,
				parentType: context.parentType,
				parentId: context.parentId,
			};
			taskMapping[ issueType ].push( taskId );
		} );
	} );

	return { normalizedTasks, taskMapping };
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
