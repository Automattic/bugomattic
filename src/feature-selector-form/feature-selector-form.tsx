import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectReportingConfigSearchResults } from '../combined-selectors/reporting-config-search-results';
import { DebouncedSearch } from '../common';
import { selectNormalizedReportingConfig } from '../reporting-config/reporting-config-slice';
import { selectFeatureSearchTerm, setFeatureSearchTerm } from './feature-selector-form-slice';
import styles from './feature-selector-form.module.css';
import { SortedProductList } from './sub-components';

export function FeatureSelectorForm() {
	const dispatch = useAppDispatch();
	const handleSearch = useCallback(
		( searchTerm: string ) => {
			dispatch( setFeatureSearchTerm( searchTerm ) );
		},
		[ dispatch ]
	);

	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const searchTerm = useAppSelector( selectFeatureSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const noResultsFound = searchTerm && searchResults.products.size === 0;
	const noResultsFoundMessage = (
		<p className={ styles.noResultsMessage } aria-live="polite">
			No results found. Try a different search or explore manually below.
		</p>
	);

	const allProductIds = Object.keys( products );
	let productsToDisplay: string[];
	if ( ! searchTerm || noResultsFound ) {
		productsToDisplay = allProductIds;
	} else {
		productsToDisplay = allProductIds.filter( ( productId ) =>
			searchResults.products.has( productId )
		);
	}

	const searchControlsId = 'reporting-config-tree-id';

	return (
		<section className={ styles.sectionWrapper }>
			<h2>1. Select a Feature</h2>
			<DebouncedSearch
				callback={ handleSearch }
				placeholder="Search for a feature"
				inputAriaControls={ searchControlsId }
			/>
			<div id={ searchControlsId }>
				{ noResultsFound && noResultsFoundMessage }
				<SortedProductList productIds={ productsToDisplay } />
			</div>
		</section>
	);
}
