import React, { useMemo } from 'react';
import { useAppSelector } from '../../app';
import { sortEntityIdsByName } from '../../common';
import { selectNormalizedReportingConfig } from '../../reporting-config';
import styles from './../feature-selector-form.module.css';
import { Product } from './product';

interface Props {
	productIds: string[];
}

export function SortedProductList( { productIds }: Props ) {
	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const sortedProductIds = useMemo(
		() => sortEntityIdsByName( productIds, products ),
		[ productIds, products ]
	);

	// Rare, but not impossible. Let's handle it!
	if ( sortedProductIds.length === 0 ) {
		return null;
	}
	return (
		<ul aria-label="Product list" className={ styles.firstLevel }>
			{ sortedProductIds.map( ( productId ) => (
				<Product key={ productId } id={ productId } />
			) ) }
		</ul>
	);
}
