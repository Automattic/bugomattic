import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectIssueFeatureId } from '../../issue-details/issue-details-slice';
import { selectNormalizedReportingConfig } from '../../reporting-config/reporting-config-slice';
import { Feature, FeatureGroup, Product } from '../../reporting-config/types';
import { EntityInfo } from './entity-info';
import styles from '../next-steps.module.css';

export function MoreInfo() {
	const featureId = useAppSelector( selectIssueFeatureId );
	const { products, featureGroups, features } = useAppSelector( selectNormalizedReportingConfig );

	if ( ! featureId ) {
		return null;
	}

	const feature = features[ featureId ];

	let product: Product;
	let featureGroup: FeatureGroup | null = null;
	if ( feature.parentType === 'featureGroup' ) {
		featureGroup = featureGroups[ feature.parentId ];
		product = products[ featureGroup.productId ];
	} else {
		product = products[ feature.parentId ];
	}

	function entityHasInfo( entity: Product | FeatureGroup | Feature | null ) {
		if ( ! entity ) {
			return false;
		}

		if ( entity.description || ( entity.learnMoreLinks && entity.learnMoreLinks.length > 0 ) ) {
			return true;
		}

		return false;
	}

	if (
		! entityHasInfo( product ) &&
		! entityHasInfo( featureGroup ) &&
		! entityHasInfo( feature )
	) {
		return null;
	}

	return (
		<section className={ styles.moreInfoSection }>
			<h4 className={ styles.moreInfoHeader }>More Info</h4>
			<div className={ styles.moreInfoColumns }>
				{ entityHasInfo( product ) && <EntityInfo entity={ product } /> }
				{ featureGroup && entityHasInfo( featureGroup ) && <EntityInfo entity={ featureGroup } /> }
				{ entityHasInfo( feature ) && <EntityInfo entity={ feature } /> }
			</div>
		</section>
	);
}
