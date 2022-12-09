import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app';
import { DebouncedSearch, sortEntityIdsByName } from '../common';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchTerm,
	selectReportingConfigSearchResults,
	setReportingConfigSearchTerm,
} from '../reporting-config';
import { Product } from './product';
import styles from './feature-selector.module.css';

export function FeatureSelector() {
	const dispatch = useAppDispatch();
	const handleSearch = useCallback(
		( searchTerm: string ) => {
			dispatch( setReportingConfigSearchTerm( searchTerm ) );
		},
		[ dispatch, setReportingConfigSearchTerm ]
	);

	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const productListElementId = 'product-list-id';

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
	const sortedProductsToDisplay = sortEntityIdsByName( productsToDisplay, products );

	return (
		<section className={ styles.sectionWrapper }>
			<h2>1. Select a Feature</h2>
			<DebouncedSearch
				callback={ handleSearch }
				placeholder="Search for a feature"
				inputAriaControls={ productListElementId }
			/>
			{ noResultsFound && noResultsFoundMessage }
			<ul id={ productListElementId } aria-label="Product list" className={ styles.firstLevel }>
				{ sortedProductsToDisplay.map( ( productId ) => (
					<Product key={ productId } id={ productId } />
				) ) }
			</ul>
		</section>
	);
}
