import { ReportingConfigApiResponse } from '../api';
import { IndexedReportingConfig, NormalizedReportingConfig, TaskMapping } from './types';

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

		const productTaskMapping: TaskMapping = {
			bug: [],
			blocker: [],
			featureRequest: [],
		};

		if ( tasks ) {
			tasks.blocker.forEach( ( taskDetails, index ) => {
				const taskId = `${ productId }__blocker__${ index }`;
				normalizedReportingConfig.tasks[ taskId ] = {
					...taskDetails,
					parentType: 'product',
					parentId: productId,
				};
				productTaskMapping.blocker.push( taskId );
			} );

			tasks.bug.forEach( ( taskDetails, index ) => {
				const taskId = `${ productId }__bug__${ index }`;
				normalizedReportingConfig.tasks[ taskId ] = {
					...taskDetails,
					parentType: 'product',
					parentId: productId,
				};
				productTaskMapping.bug.push( taskId );
			} );

			tasks.bug.forEach( ( taskDetails, index ) => {
				const taskId = `${ productId }__featureRequest__${ index }`;
				normalizedReportingConfig.tasks[ taskId ] = {
					...taskDetails,
					parentType: 'product',
					parentId: productId,
				};
				productTaskMapping.featureRequest.push( taskId );
			} );
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

				const featureGroupTaskMapping: TaskMapping = {
					bug: [],
					blocker: [],
					featureRequest: [],
				};

				if ( tasks ) {
					tasks.blocker.forEach( ( taskDetails, index ) => {
						const taskId = `${ featureGroupId }__blocker__${ index }`;
						normalizedReportingConfig.tasks[ taskId ] = {
							...taskDetails,
							parentType: 'featureGroup',
							parentId: featureGroupId,
						};
						featureGroupTaskMapping.blocker.push( taskId );
					} );

					tasks.bug.forEach( ( taskDetails, index ) => {
						const taskId = `${ featureGroupId }__bug__${ index }`;
						normalizedReportingConfig.tasks[ taskId ] = {
							...taskDetails,
							parentType: 'featureGroup',
							parentId: featureGroupId,
						};
						featureGroupTaskMapping.bug.push( taskId );
					} );

					tasks.bug.forEach( ( taskDetails, index ) => {
						const taskId = `${ featureGroupId }__featureRequest__${ index }`;
						normalizedReportingConfig.tasks[ taskId ] = {
							...taskDetails,
							parentType: 'featureGroup',
							parentId: featureGroupId,
						};
						featureGroupTaskMapping.featureRequest.push( taskId );
					} );
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

					const featureTaskMapping: TaskMapping = {
						bug: [],
						blocker: [],
						featureRequest: [],
					};

					if ( tasks ) {
						tasks.blocker.forEach( ( taskDetails, index ) => {
							const taskId = `${ featureId }__blocker__${ index }`;
							normalizedReportingConfig.tasks[ taskId ] = {
								...taskDetails,
								parentType: 'feature',
								parentId: featureId,
							};
							featureTaskMapping.blocker.push( taskId );
						} );

						tasks.bug.forEach( ( taskDetails, index ) => {
							const taskId = `${ featureId }__bug__${ index }`;
							normalizedReportingConfig.tasks[ taskId ] = {
								...taskDetails,
								parentType: 'feature',
								parentId: featureId,
							};
							featureTaskMapping.bug.push( taskId );
						} );

						tasks.bug.forEach( ( taskDetails, index ) => {
							const taskId = `${ featureId }__featureRequest__${ index }`;
							normalizedReportingConfig.tasks[ taskId ] = {
								...taskDetails,
								parentType: 'feature',
								parentId: featureId,
							};
							featureTaskMapping.featureRequest.push( taskId );
						} );
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

				const featureTaskMapping: TaskMapping = {
					bug: [],
					blocker: [],
					featureRequest: [],
				};

				if ( tasks ) {
					tasks.blocker.forEach( ( taskDetails, index ) => {
						const taskId = `${ featureId }__blocker__${ index }`;
						normalizedReportingConfig.tasks[ taskId ] = {
							...taskDetails,
							parentType: 'feature',
							parentId: featureId,
						};
						featureTaskMapping.blocker.push( taskId );
					} );

					tasks.bug.forEach( ( taskDetails, index ) => {
						const taskId = `${ featureId }__bug__${ index }`;
						normalizedReportingConfig.tasks[ taskId ] = {
							...taskDetails,
							parentType: 'feature',
							parentId: featureId,
						};
						featureTaskMapping.bug.push( taskId );
					} );

					tasks.bug.forEach( ( taskDetails, index ) => {
						const taskId = `${ featureId }__featureRequest__${ index }`;
						normalizedReportingConfig.tasks[ taskId ] = {
							...taskDetails,
							parentType: 'feature',
							parentId: featureId,
						};
						featureTaskMapping.featureRequest.push( taskId );
					} );
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

export function indexReportingConfig(
	_response: ReportingConfigApiResponse
): IndexedReportingConfig {
	// TODO: create real implementation once we know the indices we need!

	return {
		foo: 'bar',
	};
}
