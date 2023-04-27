import { createSelector } from '@reduxjs/toolkit';
import { includesIgnoringCase } from '../common/lib';
import { selectFeatureSearchTerm } from '../feature-selector-form/feature-selector-form-slice';
import {
	selectNormalizedReportingConfig,
	selectIndexedReportingConfig,
} from '../static-data/reporting-config/reporting-config-slice';
import {
	NormalizedReportingConfig,
	TaskParentEntityType,
	IndexedReportingConfig,
} from '../static-data/reporting-config/types';
import { ReportingConfigSearchResults } from './types';
import { tokenizeAndNormalize } from '../common/lib';

function searchReportingConfig(
	searchTerm: string,
	reportingConfig: NormalizedReportingConfig,
	invertedIndex: IndexedReportingConfig
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

	const addFeatureGroupAndParents = ( featureGroupId: string ) => {
		searchResults.featureGroups.add( featureGroupId );
		searchResults.products.add( featureGroups[ featureGroupId ].productId );
	};

	const addFeatureAndParents = ( featureId: string ) => {
		searchResults.features.add( featureId );

		const feature = features[ featureId ];
		if ( feature.parentType === 'product' ) {
			searchResults.products.add( feature.parentId );
		} else {
			searchResults.featureGroups.add( feature.parentId );
			const parentFeatureGroup = featureGroups[ feature.parentId ];
			searchResults.products.add( parentFeatureGroup.productId );
		}
	};

	for ( const productId in products ) {
		const product = products[ productId ];
		if ( includesIgnoringCase( product.name, searchTerm ) ) {
			searchResults.products.add( productId );
		}
	}

	for ( const featureGroupId in featureGroups ) {
		const featureGroup = featureGroups[ featureGroupId ];
		if ( includesIgnoringCase( featureGroup.name, searchTerm ) ) {
			addFeatureGroupAndParents( featureGroupId );
		}
	}

	for ( const featureId in features ) {
		const feature = features[ featureId ];
		const keywordsIncludeSearchTerm = () =>
			feature.keywords?.some( ( keyword ) => includesIgnoringCase( keyword, searchTerm ) );

		if ( includesIgnoringCase( feature.name, searchTerm ) || keywordsIncludeSearchTerm() ) {
			addFeatureAndParents( featureId );
		}
	}

	// Finally, search for the search term in the description of the products and feature areas
	const searchTermTokens = tokenizeAndNormalize( searchTerm );
	const scores: Record< string, { type: TaskParentEntityType; score: number } > = {};

	for ( const token of searchTermTokens ) {
		const matchingEntities = invertedIndex[ token ] || [];

		for ( const { type, id, weight } of matchingEntities ) {
			if ( ! scores[ id ] ) {
				scores[ id ] = { type, score: 0 };
			}
			scores[ id ].score += weight;
		}
	}

	const scoreThreshold = 1;
	const addToSearchResultsByType = {
		product: ( entityId: string ) => searchResults.products.add( entityId ),
		featureGroup: ( entityId: string ) => addFeatureGroupAndParents( entityId ),
		feature: ( entityId: string ) => addFeatureAndParents( entityId ),
	};

	for ( const entityId in scores ) {
		if ( scores[ entityId ].score >= scoreThreshold ) {
			const entityType = scores[ entityId ].type;
			const addToSearchResults = addToSearchResultsByType[ entityType ];
			addToSearchResults( entityId );
		}
	}

	return searchResults;
}

// Searching all of the reporting config is expensive, and these search results are needed by several components.
// For performance, we need to memo-ize (cache) this piece of derived state.
// The "createSelector" function lets you  do just that:
// https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization
export const selectReportingConfigSearchResults = createSelector(
	[ selectFeatureSearchTerm, selectNormalizedReportingConfig, selectIndexedReportingConfig ],
	( searchTerm, reportingConfig, indexReportingConfig ) => {
		return searchReportingConfig( searchTerm, reportingConfig, indexReportingConfig );
	}
);
