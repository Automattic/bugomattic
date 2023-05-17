import React, { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../static-data/reporting-config/reporting-config-slice';
import styles from '../feature-selector-form.module.css';
import { selectSelectedFeatureId, setSelectedFeatureId } from '../feature-selector-form-slice';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { SortedKeywordList } from './sorted-keyword-list';
import { selectReposForFeature } from '../../combined-selectors/relevant-task-ids';
import { SearchHighlighter } from './search-hightlighter';

export function SelectedFeatureDetails() {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const featureId = useAppSelector( selectSelectedFeatureId );
	const repositories = useAppSelector( selectReposForFeature );
	const { features } = useAppSelector( selectNormalizedReportingConfig );

	// This should be handled in parent components, but adding for safety, and to keep typing happy.
	if ( ! featureId ) {
		return null;
	}

	const { name: featureName, description, keywords } = features[ featureId ];

	const handleClearClick = () => {
		dispatch( setSelectedFeatureId( null ) );
		monitoringClient.analytics.recordEvent( 'feature_clear' );
	};

	let keywordsDisplay: ReactNode;
	if ( keywords && keywords.length > 0 ) {
		keywordsDisplay = <SortedKeywordList keywords={ keywords } />;
	} else {
		keywordsDisplay = (
			<span data-testid={ 'keywords-no-result' } className={ styles.noResults }>
				None
			</span>
		);
	}

	let repositoriesDisplay: ReactNode;
	const dataTestId = 'selected-feature-repositories';

	if ( repositories.length > 0 ) {
		const repositoriesList = repositories.join( ', ' );
		repositoriesDisplay = (
			<span data-testid={ dataTestId } className={ styles.repositoriesList }>
				{ repositoriesList }
			</span>
		);
	} else {
		repositoriesDisplay = (
			<span data-testid={ dataTestId } className={ styles.noResults }>
				None
			</span>
		);
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
					<SearchHighlighter tokenize={ true }>{ description }</SearchHighlighter>
				</p>
			) }
			<div className={ styles.selectedFeatureRepositories }>
				<h4 className="screenReaderOnly">Repositories for currently selected feature:</h4>
				<p className={ styles.selectedFeatureRepositoriesTitle }>Repositories</p>
				{ repositoriesDisplay }
			</div>

			<div className={ styles.selectedFeatureKeywords }>
				<h4 className="screenReaderOnly">Keywords for currently selected feature:</h4>
				<p className={ styles.selectedFeatureKeywordTitle }>Keywords</p>
				{ keywordsDisplay }
			</div>
		</div>
	);
}
