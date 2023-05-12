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
import {
	ReportingConfigSearchResults,
	MatchType,
	MatchOption,
	DescriptionMatch,
	ChildMatch,
} from './types';
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

	private updateMatchEntity(
		entityType: keyof ReportingConfigSearchResults,
		entityId: string,
		match: MatchOption
	): void {
		const entity = this.searchResults[ entityType ][ entityId ];
		if ( ! entity || this.isPriorityMatch( entity.matchType, match.matchType ) ) {
			this.searchResults[ entityType ][ entityId ] = match;
		}
	}

	private isPriorityMatch( existingMatchType: MatchType, newMatchType: MatchType ): boolean {
		const priority = {
			name: 3,
			keyword: 2,
			description: 1,
			child: 0,
		};
		return priority[ newMatchType ] >= priority[ existingMatchType ];
	}

	private addFeatureGroupAndParents( entityId: string, match: MatchOption ): void {
		this.updateMatchEntity( 'featureGroups', entityId, match );
		const id = this.featureGroups[ entityId ].productId;
		this.updateMatchEntity( 'products', id, { matchType: 'child' } );
	}

	private addFeatureAndParents( entityId: string, match: MatchOption ): void {
		this.updateMatchEntity( 'features', entityId, match );

		const childMatch: () => ChildMatch = () => ( {
			matchType: 'child',
		} );

		const feature = this.features[ entityId ];
		if ( feature.parentType === 'product' ) {
			this.updateMatchEntity( 'products', feature.parentId, childMatch() );
		} else {
			this.updateMatchEntity( 'featureGroups', feature.parentId, childMatch() );
			const parentFeatureGroup = this.featureGroups[ feature.parentId ];
			this.updateMatchEntity( 'products', parentFeatureGroup.productId, childMatch() );
		}
	}

	searchByName() {
		for ( const productId in this.products ) {
			const product = this.products[ productId ];
			if ( includesIgnoringCase( product.name, this.searchTerm ) ) {
				this.updateMatchEntity( 'products', productId, { matchType: 'name' } );
			}
		}

		for ( const featureGroupId in this.featureGroups ) {
			const featureGroup = this.featureGroups[ featureGroupId ];
			if ( includesIgnoringCase( featureGroup.name, this.searchTerm ) ) {
				this.addFeatureGroupAndParents( featureGroupId, { matchType: 'name' } );
			}
		}

		for ( const featureId in this.features ) {
			const feature = this.features[ featureId ];

			feature.keywords?.some( ( keyword: string ) => {
				const includesSearchTerm = includesIgnoringCase( keyword, this.searchTerm );
				if ( includesSearchTerm ) {
					this.addFeatureAndParents( featureId, { matchType: 'keyword', keyword: keyword } );
				}
			} );

			if ( includesIgnoringCase( feature.name, this.searchTerm ) ) {
				this.addFeatureAndParents( featureId, { matchType: 'name' } );
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
			}
		}

		const scoreThreshold = 1;
		const descriptionMatch: () => DescriptionMatch = () => ( {
			matchType: 'description',
		} );

		for ( const entityId in scores.product ) {
			if ( scores.product[ entityId ] >= scoreThreshold ) {
				this.updateMatchEntity( 'products', entityId, descriptionMatch() );
			}
		}

		for ( const entityId in scores.featureGroup ) {
			if ( scores.featureGroup[ entityId ] >= scoreThreshold ) {
				this.addFeatureGroupAndParents( entityId, descriptionMatch() );
			}
		}

		for ( const entityId in scores.feature ) {
			if ( scores.feature[ entityId ] >= scoreThreshold ) {
				this.addFeatureAndParents( entityId, descriptionMatch() );
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
