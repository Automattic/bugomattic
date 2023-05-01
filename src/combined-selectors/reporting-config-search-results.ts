import { createSelector } from '@reduxjs/toolkit';
import { includesIgnoringCase } from '../common/lib';
import { selectFeatureSearchTerm } from '../feature-selector-form/feature-selector-form-slice';
import {
	selectNormalizedReportingConfig,
	selectIndexedReportingConfig,
} from '../static-data/reporting-config/reporting-config-slice';
import {
	NormalizedReportingConfig,
	IndexedReportingConfig,
	FeatureGroups,
	Features,
	Products,
} from '../static-data/reporting-config/types';
import { ReportingConfigSearchResults } from './types';
import { tokenizeAndNormalize } from '../common/lib';

function addFeatureGroupAndParents(
	featureGroupId: string,
	searchResults: ReportingConfigSearchResults,
	featureGroups: FeatureGroups
): void {
	searchResults.featureGroups.add( featureGroupId );
	searchResults.products.add( featureGroups[ featureGroupId ].productId );
}

function addFeatureAndParents(
	featureId: string,
	searchResults: ReportingConfigSearchResults,
	features: Features,
	featureGroups: FeatureGroups
) {
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

function searchByName(
	searchTerm: string,
	products: Products,
	featureGroups: FeatureGroups,
	features: Features,
	searchResults: ReportingConfigSearchResults
) {
	for ( const productId in products ) {
		const product = products[ productId ];
		if ( includesIgnoringCase( product.name, searchTerm ) ) {
			searchResults.products.add( productId );
		}
	}

	for ( const featureGroupId in featureGroups ) {
		const featureGroup = featureGroups[ featureGroupId ];
		if ( includesIgnoringCase( featureGroup.name, searchTerm ) ) {
			addFeatureGroupAndParents( featureGroupId, searchResults, featureGroups );
		}
	}

	for ( const featureId in features ) {
		const feature = features[ featureId ];
		const keywordsIncludeSearchTerm = () =>
			feature.keywords?.some( ( keyword: string ) => includesIgnoringCase( keyword, searchTerm ) );

		if ( includesIgnoringCase( feature.name, searchTerm ) || keywordsIncludeSearchTerm() ) {
			addFeatureAndParents( featureId, searchResults, features, featureGroups );
		}
	}
}

function searchInDescription(
	searchTermTokens: string[],
	invertedIndex: IndexedReportingConfig,
	searchResults: ReportingConfigSearchResults,
	featureGroups: FeatureGroups,
	features: Features
) {
	const scores = {
		product: {} as Record< string, number >,
		featureGroup: {} as Record< string, number >,
		feature: {} as Record< string, number >,
	};

	for ( const token of searchTermTokens ) {
		const matchingEntities = invertedIndex[ token ] || [];

		for ( const { type, id, weight } of matchingEntities ) {
			if ( ! scores[ type ][ id ] ) {
				scores[ type ][ id ] = 0;
			}
			scores[ type ][ id ] += weight;

			// Store the matched terms in the matchedEntities object
			if ( ! searchResults.descriptionMatchedTerms[ type ] ) {
				searchResults.descriptionMatchedTerms[ type ] = {};
			}
			if ( ! searchResults.descriptionMatchedTerms[ type ][ id ] ) {
				searchResults.descriptionMatchedTerms[ type ][ id ] = new Set();
			}
			searchResults.descriptionMatchedTerms[ type ][ id ].add( token );
		}
	}
	const scoreThreshold = 1;

	for ( const entityId in scores.product ) {
		if ( scores.product[ entityId ] >= scoreThreshold ) {
			searchResults.products.add( entityId );
		}
	}

	for ( const entityId in scores.featureGroup ) {
		if ( scores.featureGroup[ entityId ] >= scoreThreshold ) {
			addFeatureGroupAndParents( entityId, searchResults, featureGroups );
		}
	}

	for ( const entityId in scores.feature ) {
		if ( scores.feature[ entityId ] >= scoreThreshold ) {
			addFeatureAndParents( entityId, searchResults, features, featureGroups );
		}
	}
}

function findStrongestMatchInDescription( searchResults: ReportingConfigSearchResults ) {
	const descriptionMatches = searchResults.descriptionMatchedTerms;
	for ( const entityType in descriptionMatches ) {
		for ( const entityId in descriptionMatches[ entityType ] ) {
			const matchedTerms = descriptionMatches[ entityType ][ entityId ];
			let strongestMatch = '';
			let maxScore = 0;
			for ( const term of matchedTerms ) {
				const currentScore = descriptionMatches[ entityType ][ entityId ].size;

				if ( currentScore > maxScore ) {
					strongestMatch = term;
					maxScore = currentScore;
				}
			}
			searchResults.strongestMatch[ entityType ][ entityId ] = strongestMatch;
		}
	}
}

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
		descriptionMatchedTerms: {},
		strongestMatch: { product: {}, featureGroup: {}, feature: {} },
	};

	if ( ! searchTerm ) {
		return searchResults;
	}

	searchByName( searchTerm, products, featureGroups, features, searchResults );

	const searchTermTokens = tokenizeAndNormalize( searchTerm );
	searchInDescription( searchTermTokens, invertedIndex, searchResults, featureGroups, features );

	findStrongestMatchInDescription( searchResults );

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

export const selectMatchedDescriptionTerms = createSelector(
	[ selectReportingConfigSearchResults, ( _, type: string, id: string ) => ( { type, id } ) ],
	( searchResults, { type, id } ) => {
		const matchedEntities = searchResults.descriptionMatchedTerms;
		const matchedTerms = matchedEntities?.[ type ]?.[ id ]
			? Array.from( matchedEntities[ type ][ id ] )
			: [];

		return matchedTerms;
	}
);

export const selectStrongestDescriptionMatch = createSelector(
	[ selectReportingConfigSearchResults, ( _, type: string, id: string ) => ( { type, id } ) ],
	( searchResults, { type, id } ) => {
		return searchResults.strongestMatch?.[ type ]?.[ id ] || '';
	}
);
