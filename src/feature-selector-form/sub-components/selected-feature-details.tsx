import React, { ReactNode } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../reporting-config/reporting-config-slice';
import { selectSelectedFeatureId } from '../feature-selector-form-slice';
import { ReactComponent as ChevronRightIcon } from '../../common/svgs/chevron-right.svg';
import styles from '../feature-selector-form.module.css';

export function SelectedFeatureDetails() {
	const { features, featureGroups, products } = useAppSelector( selectNormalizedReportingConfig );
	const selectedFeatureId = useAppSelector( selectSelectedFeatureId );

	if ( ! selectedFeatureId ) {
		return <div className={ styles.selectedFeatureInfo }>{ null }</div>;
	}

	const { name: featureName, description, parentId, parentType } = features[ selectedFeatureId ];

	let productName: string;
	let featureGroupName: string | null = null;
	if ( parentType === 'product' ) {
		productName = products[ parentId ].name;
	} else {
		// Parent is a Feature Group
		const featureGroup = featureGroups[ parentId ];
		featureGroupName = featureGroup.name;
		productName = products[ featureGroup.productId ].name;
	}

	const AncestorIcon = () => <ChevronRightIcon className={ styles.ancestorIcon } />;

	let featureGroupDisplay: ReactNode = null;
	if ( featureGroupName ) {
		featureGroupDisplay = (
			<span className={ styles.ancestorEntry }>
				{ featureGroupName } <AncestorIcon />
			</span>
		);
	}

	let featureDescriptionDisplay: ReactNode = null;
	if ( description ) {
		featureDescriptionDisplay = (
			<p className={ styles.selectedFeatureDescription }>{ description }</p>
		);
	}

	return (
		<div>
			<div className={ styles.selectedFeatureAncestry }>
				<span className={ styles.ancestorEntry }>
					{ productName } <AncestorIcon />
				</span>
				{ featureGroupDisplay }
				<span>{ featureName }</span>
			</div>
			{ featureDescriptionDisplay }
		</div>
	);
}
