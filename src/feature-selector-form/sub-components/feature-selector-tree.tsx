import React, { ReactNode } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectReportingConfigSearchResults } from '../../combined-selectors/reporting-config-search-results';
import { selectNormalizedReportingConfig } from '../../static-data/reporting-config/reporting-config-slice';
import { selectFeatureSearchTerm } from '../feature-selector-form-slice';
import styles from '../feature-selector-form.module.css';
import { SortedProductList } from './sorted-product-list';

interface Props {
	parentElementId: string;
}

export function FeatureSelectorTree( { parentElementId }: Props ) {
	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const searchTerm = useAppSelector( selectFeatureSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	let searchMessageDisplay: ReactNode;
	if ( ! searchTerm ) {
		searchMessageDisplay = null;
	} else if ( searchResults.products.size > 0 ) {
		searchMessageDisplay = (
			<p className="screenReaderOnly" role="alert">
				Results found. Search results are below.
			</p>
		);
	} else {
		searchMessageDisplay = (
			<p className={ styles.noResultsMessage } role="alert">
				No results found. Try a different search or explore manually below.
			</p>
		);
	}

	const allProductIds = Object.keys( products );
	let productsToDisplay: string[];
	if ( ! searchTerm || searchResults.products.size === 0 ) {
		productsToDisplay = allProductIds;
	} else {
		productsToDisplay = allProductIds.filter( ( productId ) =>
			searchResults.products.has( productId )
		);
	}

	return (
		<fieldset className={ styles.treeWrapper } id={ parentElementId }>
			{ searchMessageDisplay }
			<legend className="screenReaderOnly">
				Expandable and collapsible tree with products, feature groups, and features
			</legend>
			<SortedProductList productIds={ productsToDisplay } />
		</fieldset>
	);
}
