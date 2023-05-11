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

class ReportingConfigSearcher {
	private searchResults: ReportingConfigSearchResults;
	private products: Products;
	private featureGroups: FeatureGroups;
	private features: Features;
	private invertedIndex: IndexedReportingConfig;
	private searchTerm: string;

	constructor(
		searchTerm: string,
		reportingConfig: NormalizedReportingConfig,
		invertedIndex: IndexedReportingConfig
	) {
		const { products, featureGroups, features } = reportingConfig;
		this.products = products;
		this.featureGroups = featureGroups;
		this.features = features;

		this.invertedIndex = invertedIndex;

		this.searchResults = {
			products: new Set(),
			featureGroups: new Set(),
			features: new Set(),
			descriptionMatchedTerms: {},
		};

		this.searchTerm = searchTerm;
	}

	private addFeatureGroupAndParents( featureGroupId: string ): void {
		this.searchResults.featureGroups.add( featureGroupId );
		this.searchResults.products.add( this.featureGroups[ featureGroupId ].productId );
	}

	private addFeatureAndParents( featureId: string ) {
		this.searchResults.features.add( featureId );

		const feature = this.features[ featureId ];
		if ( feature.parentType === 'product' ) {
			this.searchResults.products.add( feature.parentId );
		} else {
			this.searchResults.featureGroups.add( feature.parentId );
			const parentFeatureGroup = this.featureGroups[ feature.parentId ];
			this.searchResults.products.add( parentFeatureGroup.productId );
		}
	}

	searchByName() {
		for ( const productId in this.products ) {
			const product = this.products[ productId ];
			if ( includesIgnoringCase( product.name, this.searchTerm ) ) {
				this.searchResults.products.add( productId );
			}
		}

		for ( const featureGroupId in this.featureGroups ) {
			const featureGroup = this.featureGroups[ featureGroupId ];
			if ( includesIgnoringCase( featureGroup.name, this.searchTerm ) ) {
				this.addFeatureGroupAndParents( featureGroupId );
			}
		}

		for ( const featureId in this.features ) {
			const feature = this.features[ featureId ];
			const keywordsIncludeSearchTerm = () =>
				feature.keywords?.some( ( keyword: string ) =>
					includesIgnoringCase( keyword, this.searchTerm )
				);

			if ( includesIgnoringCase( feature.name, this.searchTerm ) || keywordsIncludeSearchTerm() ) {
				this.addFeatureAndParents( featureId );
			}
		}

		return this;
	}

	searchInDescription() {
		const searchTermTokens = tokenizeAndNormalize( this.searchTerm );
		const scores = {
			product: {} as Record< string, number >,
			featureGroup: {} as Record< string, number >,
			feature: {} as Record< string, number >,
		};

		for ( const token of searchTermTokens ) {
			const matchingEntities = this.invertedIndex[ token ] || [];

			for ( const { type, id, weight } of matchingEntities ) {
				if ( ! scores[ type ][ id ] ) {
					scores[ type ][ id ] = 0;
				}
				scores[ type ][ id ] += weight;

				// Store the matched terms in the matchedEntities object
				if ( ! this.searchResults.descriptionMatchedTerms[ type ] ) {
					this.searchResults.descriptionMatchedTerms[ type ] = {};
				}
				if ( ! this.searchResults.descriptionMatchedTerms[ type ][ id ] ) {
					this.searchResults.descriptionMatchedTerms[ type ][ id ] = new Set();
				}
				this.searchResults.descriptionMatchedTerms[ type ][ id ].add( token );
			}
		}
		const scoreThreshold = 1;

		for ( const entityId in scores.product ) {
			if ( scores.product[ entityId ] >= scoreThreshold ) {
				this.searchResults.products.add( entityId );
			}
		}

		for ( const entityId in scores.featureGroup ) {
			if ( scores.featureGroup[ entityId ] >= scoreThreshold ) {
				this.addFeatureGroupAndParents( entityId );
			}
		}

		for ( const entityId in scores.feature ) {
			if ( scores.feature[ entityId ] >= scoreThreshold ) {
				this.addFeatureAndParents( entityId );
			}
		}

		return this;
	}

	getSearchResults() {
		return this.searchResults;
	}
}

function searchReportingConfig(
	searchTerm: string,
	reportingConfig: NormalizedReportingConfig,
	invertedIndex: IndexedReportingConfig
): ReportingConfigSearchResults {
	const searcher = new ReportingConfigSearcher( searchTerm, reportingConfig, invertedIndex );

	if ( ! searchTerm ) {
		return searcher.getSearchResults();
	}

	return searcher.searchByName().searchInDescription().getSearchResults();
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
