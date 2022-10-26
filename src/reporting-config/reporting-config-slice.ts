import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';
import { ReportingConfigApiResponse } from '../api';
import { IndexedReportingConfig, NormalizedReportingConfig, ReportingConfigState } from './types';

const initialNormalizedReportingConfig: NormalizedReportingConfig = {
	products: {},
	featureGroups: {},
	features: {},
};

const initialIndexedReportingConfig: IndexedReportingConfig = {
	foo: 'bar',
};

const initialState: ReportingConfigState = {
	normalized: initialNormalizedReportingConfig,
	indexed: initialIndexedReportingConfig,
};

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

export const reportingConfigSlice = createSlice( {
	name: 'reportingConfig',
	initialState,
	reducers: {
		createFromApiResponse: ( state, action: PayloadAction< ReportingConfigApiResponse > ) => {
			state = {
				normalized: normalizeReportingConfig( action.payload ),
				indexed: indexReportingConfig( action.payload ),
			};
			return state;
		},
	},
} );

export const { createFromApiResponse } = reportingConfigSlice.actions;
export const reportingConfigReducer = reportingConfigSlice.reducer;

export function selectReportingConfig( state: RootState ) {
	return state.reportingConfig;
}

export function selectNormalizedReportingConfig( state: RootState ) {
	return state.reportingConfig.normalized;
}

export function selectIndexedReportingConfig( state: RootState ) {
	return state.reportingConfig.indexed;
}
