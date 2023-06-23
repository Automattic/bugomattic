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
	} else if ( Object.keys( searchResults.products ).length > 0 ) {
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
	if ( ! searchTerm || Object.keys( searchResults.products ).length === 0 ) {
		productsToDisplay = allProductIds;
	} else {
		productsToDisplay = allProductIds.filter(
			( productId ) => productId in searchResults.products
		);
	}

	// Keying the whole list actually provides us a pretty big performance benefit when rendering the tree.
	// Reconciling the DOM after a search when you have a big tree expanded is really slow.
	// It's actually almost always faster to just throw away the whole tree and rebuild it based on the new search results.
	// We already reset the UI for the user, so just rebuilding the whole tree doesn't change the user experience at all!
	const listKey = `search-${ searchTerm }`;

	return (
		<div className={ styles.treeWrapper }>
			<fieldset className={ styles.treeFieldset } id={ parentElementId }>
				{ searchMessageDisplay }
				<legend className="screenReaderOnly">
					Expandable and collapsible tree with products, feature groups, and features
				</legend>
				<SortedProductList key={ listKey } productIds={ productsToDisplay } />
			</fieldset>
		</div>
	);
}
