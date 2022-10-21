import { IndexedReportingConfig, NormalizedReportingConfig, ReportingConfig } from '.';
import { ReportingConfigApiResponse } from '../api';

export function createReportingConfig( response: ReportingConfigApiResponse ): ReportingConfig {
	return {
		normalized: normalizeReportingConfig( response ),
		indexed: indexReportingConfig( response ),
	};
}

function normalizeReportingConfig(
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

function indexReportingConfig( _response: ReportingConfigApiResponse ): IndexedReportingConfig {
	// TODO: create real implementation once we know the indices we need!

	return {
		foo: 'bar',
	};
}
