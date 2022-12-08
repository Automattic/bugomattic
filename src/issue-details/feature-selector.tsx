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

	const createProductListDisplay = ( productIds: string[] ) => {
		const sortedProductIds = sortEntityIdsByName( productIds, products );
		return (
			<ul className={ styles.firstLevel }>
				{ sortedProductIds.map( ( productId ) => (
					<Product key={ productId } id={ productId } />
				) ) }
			</ul>
		);
	};
	const allProductIds = Object.keys( products );

	let display: React.ReactNode;
	if ( ! searchTerm ) {
		display = createProductListDisplay( allProductIds );
	} else if ( searchResults.products.size > 0 ) {
		const filteredProductIds = allProductIds.filter( ( productId ) =>
			searchResults.products.has( productId )
		);
		display = createProductListDisplay( filteredProductIds );
	} else {
		display = (
			<p className={ styles.noResultsMessage }>No results found. Try a different search.</p>
		);
	}

	return (
		<section>
			<h2>1. Select a Feature</h2>
			<DebouncedSearch callback={ handleSearch } placeholder="Search for a feature" />
			<div className={ styles.reportingConfigTree }>{ display }</div>
		</section>
	);
}
