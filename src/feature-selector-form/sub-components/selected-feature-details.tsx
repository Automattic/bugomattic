import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../reporting-config/reporting-config-slice';
import { ReactComponent as ChevronRightIcon } from '../../common/svgs/chevron-right.svg';
import styles from '../feature-selector-form.module.css';
import { setSelectedFeatureId } from '../feature-selector-form-slice';
import { useMonitoring } from '../../monitoring/monitoring-provider';

interface Props {
	featureId: string;
}

export function SelectedFeatureDetails( { featureId }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const { features, featureGroups, products } = useAppSelector( selectNormalizedReportingConfig );
	const { name: featureName, description, parentId, parentType } = features[ featureId ];

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

	const BreadcrumbIcon = () => (
		<ChevronRightIcon aria-label="Is a parent of" className={ styles.breadcrumbIcon } />
	);

	const handleClearClick = () => {
		dispatch( setSelectedFeatureId( null ) );
		monitoringClient.analytics.recordEvent( 'feature_clear' );
	};

	return (
		<div>
			<h3 className="screenReaderOnly">Currently selected feature:</h3>

			<div>
				<span className={ styles.selectedFeatureName }>{ featureName }</span>
				<button
					type="button"
					className={ styles.clearButton }
					aria-label="Clear currently selected feature"
					onClick={ handleClearClick }
				>
					Clear
				</button>
			</div>

			{ description && <p className={ styles.selectedFeatureDescription }>{ description }</p> }

			<h4 className="screenReaderOnly">Breadcrumb for currently selected feature:</h4>
			<div className={ styles.selectedFeatureBreadcrumb }>
				{ productName }
				<BreadcrumbIcon />
				{ featureGroupName && (
					<>
						{ featureGroupName }
						<BreadcrumbIcon />
					</>
				) }
				{ featureName }
			</div>
		</div>
	);
}
