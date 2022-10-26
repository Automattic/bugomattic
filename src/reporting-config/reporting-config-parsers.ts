import { ReportingConfigApiResponse } from '../api';
import { IndexedReportingConfig, NormalizedReportingConfig } from './types';

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
	};

	for ( const productName in response ) {
		const { featureGroups, features, description, learnMoreLinks, taskMapping } =
			response[ productName ];
		const productId = productName; // We can use name as ID, as being top level, they are unique.

		normalizedReportingConfig.products[ productId ] = {
			id: productId,
			name: productName,
			description: description,
			learnMoreLinks: learnMoreLinks,
			taskMapping: taskMapping,
		};

		if ( featureGroups ) {
			for ( const featureGroupName in featureGroups ) {
				const { features, description, learnMoreLinks, taskMapping } =
					featureGroups[ featureGroupName ];
				const featureGroupId = `${ productName }__${ featureGroupName }`;

				normalizedReportingConfig.featureGroups[ featureGroupId ] = {
					id: featureGroupId,
					name: featureGroupName,
					description: description,
					learnMoreLinks: learnMoreLinks,
					taskMapping: taskMapping,
					product: productId,
				};

				for ( const featureName in features ) {
					const { description, keywords, learnMoreLinks, taskMapping } = features[ featureName ];
					const featureId = `${ productName }__${ featureGroupName }__${ featureName }`;

					normalizedReportingConfig.features[ featureId ] = {
						id: featureId,
						name: featureName,
						description: description,
						keywords: keywords,
						learnMoreLinks: learnMoreLinks,
						taskMapping: taskMapping,
						featureGroup: featureGroupId,
					};
				}
			}
		}

		if ( features ) {
			for ( const featureName in features ) {
				const { description, keywords, learnMoreLinks, taskMapping } = features[ featureName ];
				const featureId = `${ productName }__${ featureName }`;

				normalizedReportingConfig.features[ featureId ] = {
					id: featureId,
					name: featureName,
					description: description,
					keywords: keywords,
					learnMoreLinks: learnMoreLinks,
					taskMapping: taskMapping,
					product: productId,
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
