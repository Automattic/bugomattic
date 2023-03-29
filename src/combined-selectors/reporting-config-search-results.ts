import { createSelector } from '@reduxjs/toolkit';
import { includesIgnoringCase } from '../common/lib';
import { selectFeatureSearchTerm } from '../feature-selector-form/feature-selector-form-slice';
import { selectNormalizedReportingConfig } from '../static-data/reporting-config/reporting-config-slice';
import { NormalizedReportingConfig } from '../static-data/reporting-config/types';
import { ReportingConfigSearchResults } from './types';

function searchReportingConfig(
	searchTerm: string,
	reportingConfig: NormalizedReportingConfig
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

	return searchResults;
}

// Searching all of the reporting config is expensive, and these search results are needed by several components.
// For performance, we need to memo-ize (cache) this piece of derived state.
// The "createSelector" function lets you  do just that:
// https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization
export const selectReportingConfigSearchResults = createSelector(
	[ selectFeatureSearchTerm, selectNormalizedReportingConfig ],
	( searchTerm, reportingConfig ) => {
		return searchReportingConfig( searchTerm, reportingConfig );
	}
);
