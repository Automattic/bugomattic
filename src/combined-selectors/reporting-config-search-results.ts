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
import { ReportingConfigSearchResults, MatchType, DescriptionMatch } from './types';
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
			products: {},
			featureGroups: {},
			features: {},
		};

		this.searchTerm = searchTerm;
	}

	private updateMatchIfNotKeyword(
		entityType: keyof ReportingConfigSearchResults,
		entityId: string,
		match: MatchType
	): void {
		const entity = this.searchResults[ entityType ][ entityId ];
		if ( ! entity || entity.matchType !== 'keyword' ) {
			this.searchResults[ entityType ][ entityId ] = match;
		}
	}

	private addEntityAndParents(
		entityType: keyof ReportingConfigSearchResults,
		entityId: string,
		match: MatchType,
		parentId?: string
	): void {
		if ( ! this.searchResults[ entityType ] ) {
			this.searchResults[ entityType ] = {};
		}

		this.updateMatchIfNotKeyword( entityType, entityId, match );

		if ( parentId ) {
			if ( entityType === 'features' && this.features[ entityId ]?.parentType === 'product' ) {
				this.updateMatchIfNotKeyword( 'products', parentId, match );
			} else if ( entityType === 'featureGroups' ) {
				// Explicitly handle the addition of parent products for feature groups
				this.updateMatchIfNotKeyword( 'products', parentId, match );
			} else {
				this.updateMatchIfNotKeyword( 'featureGroups', parentId, match );
				const parentFeatureGroup = this.featureGroups[ parentId ];
				if ( parentFeatureGroup ) {
					this.updateMatchIfNotKeyword( 'products', parentFeatureGroup.productId, match );
				}
			}
		}
	}

	searchByName() {
		for ( const productId in this.products ) {
			const product = this.products[ productId ];
			if ( includesIgnoringCase( product.name, this.searchTerm ) ) {
				this.addEntityAndParents( 'products', productId, { matchType: 'name' } );
			}
		}

		for ( const featureGroupId in this.featureGroups ) {
			const featureGroup = this.featureGroups[ featureGroupId ];
			if ( includesIgnoringCase( featureGroup.name, this.searchTerm ) ) {
				this.addEntityAndParents(
					'featureGroups',
					featureGroupId,
					{ matchType: 'name' },
					featureGroup.productId
				);
			}
		}

		for ( const featureId in this.features ) {
			const feature = this.features[ featureId ];

			if ( includesIgnoringCase( feature.name, this.searchTerm ) ) {
				this.addEntityAndParents( 'features', featureId, { matchType: 'name' }, feature.parentId );
			}

			feature.keywords?.some( ( keyword: string ) => {
				const includesSearchTerm = includesIgnoringCase( keyword, this.searchTerm );
				if ( includesSearchTerm ) {
					this.addEntityAndParents(
						'features',
						featureId,
						{ matchType: 'keyword', keyword: keyword },
						feature.parentId
					);
				}
				return includesSearchTerm;
			} );
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
			}
		}

		const scoreThreshold = 1;
		const descriptionMatch: () => DescriptionMatch = () => ( {
			matchType: 'description',
			matchedTerms: new Set( searchTermTokens ),
		} );

		for ( const entityId in scores.product ) {
			if ( scores.product[ entityId ] >= scoreThreshold ) {
				this.addEntityAndParents( 'products', entityId, descriptionMatch() );
			}
		}

		for ( const entityId in scores.featureGroup ) {
			if ( scores.featureGroup[ entityId ] >= scoreThreshold ) {
				this.addEntityAndParents( 'featureGroups', entityId, descriptionMatch() );
				const parentFeatureGroup = this.featureGroups[ entityId ];
				this.addEntityAndParents( 'products', parentFeatureGroup.productId, descriptionMatch() );
			}
		}

		for ( const entityId in scores.feature ) {
			if ( scores.feature[ entityId ] >= scoreThreshold ) {
				this.addEntityAndParents( 'features', entityId, descriptionMatch() );
				const feature = this.features[ entityId ];
				this.addEntityAndParents( 'products', feature.parentId, descriptionMatch() );
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
