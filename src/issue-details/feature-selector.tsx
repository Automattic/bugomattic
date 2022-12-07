import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchTerm,
	selectReportingConfigSearchResults,
	setReportingConfigSearchTerm,
} from '../reporting-config';
import { Product } from './product';
import { Search } from './search';

export function FeatureSelector() {
	const dispatch = useAppDispatch();
	const handleSearch = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) =>
			dispatch( setReportingConfigSearchTerm( event.target.value ) ),
		[ dispatch, setReportingConfigSearchTerm ]
	);

	const reportingConfig = useAppSelector( selectNormalizedReportingConfig );
	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const createProductListDisplay = ( productIds: string[] ) => (
		<ul>
			{ productIds.map( ( productId ) => (
				<Product key={ productId } id={ productId } />
			) ) }
		</ul>
	);
	const allProductIds = Object.keys( reportingConfig.products );

	let display: React.ReactNode;
	if ( ! searchTerm ) {
		display = createProductListDisplay( allProductIds );
	} else if ( searchResults.products.size > 0 ) {
		const filteredProductIds = allProductIds.filter( ( productId ) =>
			searchResults.products.has( productId )
		);
		display = createProductListDisplay( filteredProductIds );
	} else {
		display = <p>No results found. Try a different search.</p>;
	}

	return (
		<div>
			<Search searchTerm={ searchTerm } handleSearch={ handleSearch } />
			<div>{ display }</div>
		</div>
	);
}
