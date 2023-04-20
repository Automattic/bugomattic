import React, { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../static-data/reporting-config/reporting-config-slice';
import styles from '../feature-selector-form.module.css';
import { setSelectedFeatureId } from '../feature-selector-form-slice';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { SortedKeywordList } from './sorted-keyword-list';

interface Props {
	featureId: string;
}

export function SelectedFeatureDetails( { featureId }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const { features } = useAppSelector( selectNormalizedReportingConfig );
	const { name: featureName, description, keywords } = features[ featureId ];

	const handleClearClick = () => {
		dispatch( setSelectedFeatureId( null ) );
		monitoringClient.analytics.recordEvent( 'feature_clear' );
	};

	let keywordsDisplay: ReactNode;
	if ( keywords ) {
		keywordsDisplay = <SortedKeywordList keywords={ keywords } />;
	} else {
		keywordsDisplay = <span className={ styles.noKeywords }>None</span>;
	}

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

			{ description && (
				<p
					data-testid={ 'selected-feature-description' }
					className={ styles.selectedFeatureDescription }
				>
					{ description }
				</p>
			) }

			<div className={ styles.selectedFeatureKeywords }>
				<h4 className="screenReaderOnly">Keywords for currently selected feature:</h4>
				<p className={ styles.selectedFeatureKeywordTitle }>Keywords</p>
				{ keywordsDisplay }
			</div>
		</div>
	);
}
