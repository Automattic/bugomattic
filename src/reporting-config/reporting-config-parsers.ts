import { ApiFeatureGroups, ApiFeatures, ApiTasks, ReportingConfigApiResponse } from '../api';
import {
	FeatureParentEntityType,
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

	// The top level of the response is a dictionary of product names.
	const products = response;

	normalizeProducts( normalizedReportingConfig, products );

	return normalizedReportingConfig;
}

function normalizeProducts(
	normalizedReportingConfig: NormalizedReportingConfig,
	products: ReportingConfigApiResponse
) {
	for ( const productName in products ) {
		const { featureGroups, features, description, learnMoreLinks, tasks } = products[ productName ];
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
			normalizeFeatureGroups( normalizedReportingConfig, featureGroups, { productId: productId } );
		}

		if ( features ) {
			normalizeFeatures( normalizedReportingConfig, features, {
				parentType: 'product',
				parentId: productId,
			} );
		}
	}
}

interface FeatureGroupContext {
	productId: string;
}

function normalizeFeatureGroups(
	normalizedReportingConfig: NormalizedReportingConfig,
	featureGroups: ApiFeatureGroups,
	context: FeatureGroupContext
) {
	for ( const featureGroupName in featureGroups ) {
		const { features, description, learnMoreLinks, tasks } = featureGroups[ featureGroupName ];
		const featureGroupId = `${ context.productId }__${ featureGroupName }`;

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
			productId: context.productId,
		};

		normalizeFeatures( normalizedReportingConfig, features, {
			parentType: 'featureGroup',
			parentId: featureGroupId,
		} );
	}
}

interface FeatureContext {
	parentType: FeatureParentEntityType;
	parentId: string;
}

function normalizeFeatures(
	normalizedReportingConfig: NormalizedReportingConfig,
	features: ApiFeatures,
	context: FeatureContext
) {
	for ( const featureName in features ) {
		const { description, keywords, learnMoreLinks, tasks } = features[ featureName ];
		const featureId = `${ context.parentId }__${ featureName }`;

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
			parentType: context.parentType,
			parentId: context.parentId,
		};
	}
}

interface TaskContext {
	parentType: TaskParentEntityType;
	parentId: string;
}

function normalizeTasks(
	apiTasks: ApiTasks,
	context: TaskContext
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
			const taskId = `${ context.parentId }__${ issueType }__${ index }`;
			normalizedTasks[ taskId ] = {
				...taskDetails,
				parentType: context.parentType,
				parentId: context.parentId,
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
