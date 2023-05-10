import React, { FormEventHandler, ReactNode, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { DebouncedSearch, FormErrorMessage } from '../common/components';
import { selectIssueFeatureId, setIssueFeatureId } from '../issue-details/issue-details-slice';
import { useMonitoring } from '../monitoring/monitoring-provider';
import {
	selectNormalizedReportingConfig,
	selectProductIdForFeature,
} from '../static-data/reporting-config/reporting-config-slice';
import {
	selectSelectedFeatureId,
	setFeatureSearchTerm,
	setSelectedFeatureId,
} from './feature-selector-form-slice';
import styles from './feature-selector-form.module.css';
import { FeatureSelectorTree } from './sub-components';
import { SelectedFeatureDetails } from './sub-components/selected-feature-details';

interface Props {
	onContinue?: () => void;
}

export function FeatureSelectorForm( { onContinue }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const issueFeatureId = useAppSelector( selectIssueFeatureId );

	// On mount, we effectively should 'reset' the form state.
	// The form feature id should be whatever was saved last.
	// Search should always start empty.
	useEffect( () => {
		dispatch( setSelectedFeatureId( issueFeatureId ) );
		dispatch( setFeatureSearchTerm( '' ) );
	}, [ dispatch, issueFeatureId ] );

	const selectedFeatureId = useAppSelector( selectSelectedFeatureId );

	const { products, features } = useAppSelector( selectNormalizedReportingConfig );
	const selectedFeatureProductId = useAppSelector( selectProductIdForFeature( selectedFeatureId ) );
	const selectedFeatureProductName = selectedFeatureProductId
		? products[ selectedFeatureProductId ].name
		: 'Unknown';
	const selectedFeatureName = selectedFeatureId ? features[ selectedFeatureId ].name : 'Unknown';

	const [ submissionAttempted, setSubmissionAttempted ] = useState( false );

	const readyToContinue = selectedFeatureId !== null;

	const handleSearch = useCallback(
		( searchTerm: string ) => {
			dispatch( setFeatureSearchTerm( searchTerm ) );
			monitoringClient.analytics.recordEvent( 'feature_search', { searchTerm } );
		},
		[ dispatch, monitoringClient.analytics ]
	);

	const handleSubmit: FormEventHandler< HTMLFormElement > = ( event ) => {
		event.preventDefault();
		setSubmissionAttempted( true );
		if ( readyToContinue ) {
			dispatch( setIssueFeatureId( selectedFeatureId ) );

			monitoringClient.analytics.recordEvent( 'feature_save', {
				productName: selectedFeatureProductName,
				featureName: selectedFeatureName,
			} );

			if ( onContinue ) {
				onContinue();
			}
		}
	};

	const searchControlsId = 'feature-selector-tree-id';

	const showFormError = submissionAttempted && ! readyToContinue;

	const bottomPanelContentId = 'feature-selector-bottom-panel-content';
	let bottomPanelDisplay: ReactNode;
	if ( showFormError ) {
		bottomPanelDisplay = (
			<div className={ styles.formErrorWrapper }>
				<FormErrorMessage>You must select a feature</FormErrorMessage>
			</div>
		);
	} else if ( selectedFeatureId ) {
		bottomPanelDisplay = <SelectedFeatureDetails />;
	} else {
		bottomPanelDisplay = null;
	}

	const subheader = `Explore the tree or use the search function to select a feature. The search results will include exact word matches from descriptions, as well as matches based on related keywords.`;

	return (
		<section className={ styles.sectionWrapper }>
			<p data-testid={ 'subheader' } className={ styles.subheader }>
				{ subheader }
			</p>
			<div className={ styles.searchWrapper }>
				<DebouncedSearch
					callback={ handleSearch }
					placeholder='Search for a feature (e.g. "site editor") '
					inputAriaLabel="Search for a feature"
					inputAriaControls={ searchControlsId }
				/>
			</div>

			<form
				onSubmit={ handleSubmit }
				aria-label="Select a feature"
				aria-describedby={ bottomPanelContentId }
			>
				<FeatureSelectorTree parentElementId={ searchControlsId } />

				<div className={ styles.bottomPanel }>
					<section id={ bottomPanelContentId } className={ styles.bottomPanelContent }>
						{ bottomPanelDisplay }
					</section>
					<div className={ styles.continueButtonWrapper }>
						<button className="primaryButton">Continue</button>
					</div>
				</div>
			</form>
		</section>
	);
}
