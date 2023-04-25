import { createSelector } from '@reduxjs/toolkit';
import { includesIgnoringCase } from '../common/lib';
import { selectFeatureSearchTerm } from '../feature-selector-form/feature-selector-form-slice';
import { selectNormalizedReportingConfig } from '../static-data/reporting-config/reporting-config-slice';
import { NormalizedReportingConfig } from '../static-data/reporting-config/types';
import { ReportingConfigSearchResults } from './types';
import { tokenizeAndNormalize } from '../common/lib';

function searchReportingConfig(
	searchTerm: string,
	reportingConfig: NormalizedReportingConfig,
	invertedIndex: Map< string, Array< { id: string; weight: number } > >
): ReportingConfigSearchResults {
	const { features, featureGroups, products } = reportingConfig;
	const searchResults: ReportingConfigSearchResults = {
		products: new Set< string >(),
		featureGroups: new Set< string >(),
		features: new Set< string >(),
	};

	if ( ! searchTerm ) {
		return searchResults;
	}
	for ( const productId in products ) {
		const product = products[ productId ];
		if ( includesIgnoringCase( product.name, searchTerm ) ) {
			searchResults.products.add( productId );
		}
	}

	for ( const featureGroupId in featureGroups ) {
		const featureGroup = featureGroups[ featureGroupId ];
		if ( includesIgnoringCase( featureGroup.name, searchTerm ) ) {
			searchResults.featureGroups.add( featureGroupId );
			searchResults.products.add( featureGroup.productId );
		}
	}

	for ( const featureId in features ) {
		const feature = features[ featureId ];
		const keywordsIncludeSearchTerm = () =>
			feature.keywords?.some( ( keyword ) => includesIgnoringCase( keyword, searchTerm ) );

		if ( includesIgnoringCase( feature.name, searchTerm ) || keywordsIncludeSearchTerm() ) {
			searchResults.features.add( featureId );

			const feature = features[ featureId ];
			if ( feature.parentType === 'product' ) {
				searchResults.products.add( feature.parentId );
			} else {
				searchResults.featureGroups.add( feature.parentId );
				const parentFeatureGroup = featureGroups[ feature.parentId ];
				searchResults.products.add( parentFeatureGroup.productId );
			}
		}
	}

	// Finally, search for the search term in the description of the products and feature areas
	const searchTermTokens = tokenizeAndNormalize( searchTerm );
	const scores: Record< string, number > = {};

	for ( const token of searchTermTokens ) {
		const matchingEntities = invertedIndex.get( token ) || [];

		for ( const { id, weight } of matchingEntities ) {
			if ( ! scores[ id ] ) {
				scores[ id ] = 0;
			}
			scores[ id ] += weight;
		}
	}

	const scoreThreshold = 1;

	for ( const entityId in scores ) {
		if ( scores[ entityId ] >= scoreThreshold ) {
			if ( products[ entityId ] ) {
				searchResults.products.add( entityId );
			} else if ( featureGroups[ entityId ] ) {
				searchResults.featureGroups.add( entityId );
				searchResults.products.add( featureGroups[ entityId ].productId );
			} else if ( features[ entityId ] ) {
				searchResults.features.add( entityId );
				if ( features[ entityId ].parentType === 'product' ) {
					searchResults.products.add( features[ entityId ].parentId );
				} else {
					searchResults.featureGroups.add( features[ entityId ].parentId );
					const parentFeatureGroup = featureGroups[ features[ entityId ].parentId ];
					searchResults.products.add( parentFeatureGroup.productId );
				}
			}
		}
	}

	return searchResults;
}

function addTokensToInvertedIndex(
	entityId: string,
	description: string | undefined,
	invertedIndex: Map< string, Array< { id: string; weight: number } > >
) {
	const descriptionTokens = description ? tokenizeAndNormalize( description ) : [];
	const tokensWithWeights = [ ...descriptionTokens.map( ( token ) => ( { token, weight: 1 } ) ) ];

	for ( const { token, weight } of tokensWithWeights ) {
		if ( ! invertedIndex.has( token ) ) {
			invertedIndex.set( token, [] );
		}

		const tokenList = invertedIndex.get( token );
		if ( tokenList ) {
			tokenList.push( { id: entityId, weight } );
		}
	}
}

function createDescriptionInvertedIndex( reportingConfig: NormalizedReportingConfig ) {
	const invertedIndex = new Map();

	const { features, featureGroups, products } = reportingConfig;

	for ( const productId in products ) {
		const product = products[ productId ];
		addTokensToInvertedIndex( productId, product.description, invertedIndex );
	}

	for ( const featureGroupId in featureGroups ) {
		const featureGroup = featureGroups[ featureGroupId ];
		addTokensToInvertedIndex( featureGroupId, featureGroup.description, invertedIndex );
	}

	for ( const featureId in features ) {
		const feature = features[ featureId ];
		addTokensToInvertedIndex( featureId, feature.description, invertedIndex );
	}

	return invertedIndex;
}

// Searching all of the reporting config is expensive, and these search results are needed by several components.
// For performance, we need to memo-ize (cache) this piece of derived state.
// The "createSelector" function lets you  do just that:
// https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization
export const selectReportingConfigSearchResults = createSelector(
	[ selectFeatureSearchTerm, selectNormalizedReportingConfig ],
	( searchTerm, reportingConfig ) => {
		return searchReportingConfig(
			searchTerm,
			reportingConfig,
			createDescriptionInvertedIndex( reportingConfig )
		);
	}
);
