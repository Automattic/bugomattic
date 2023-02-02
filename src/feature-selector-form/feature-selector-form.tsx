import React, { FormEventHandler, ReactNode, useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { DebouncedSearch, FormErrorMessage } from '../common/components';
import { selectIssueFeatureId } from '../issue-details/issue-details-slice';
import { completeFeatureSelectionStep } from '../reporting-flow/navigation-actions';
import { ActiveStep } from '../reporting-flow/types';
import {
	selectSelectedFeatureId,
	setFeatureSearchTerm,
	setSelectedFeatureId,
} from './feature-selector-form-slice';
import styles from './feature-selector-form.module.css';
import { FeatureSelectorTree } from './sub-components';
import { SelectedFeatureDetails } from './sub-components/selected-feature-details';

interface Props {
	nextStep?: ActiveStep;
}

export function FeatureSelectorForm( { nextStep }: Props ) {
	const dispatch = useAppDispatch();
	const issueFeatureId = useAppSelector( selectIssueFeatureId );

	// On mount, we effectively should 'reset' the form state.
	// The form feature id should be whatever was saved last.
	// Search should always start empty.
	useEffect( () => {
		dispatch( setSelectedFeatureId( issueFeatureId ) );
		dispatch( setFeatureSearchTerm( '' ) );
	}, [ dispatch, issueFeatureId ] );

	const selectedFeatureId = useAppSelector( selectSelectedFeatureId );

	const [ submissionAttempted, setSubmissionAttempted ] = useState( false );

	const readyToContinue = selectedFeatureId !== null;

	const handleSearch = useCallback(
		( searchTerm: string ) => {
			dispatch( setFeatureSearchTerm( searchTerm ) );
		},
		[ dispatch ]
	);

	const handleSubmit: FormEventHandler< HTMLFormElement > = ( event ) => {
		event.preventDefault();
		setSubmissionAttempted( true );
		if ( readyToContinue ) {
			dispatch( completeFeatureSelectionStep( { featureId: selectedFeatureId, nextStep } ) );
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
		bottomPanelDisplay = <SelectedFeatureDetails featureId={ selectedFeatureId } />;
	} else {
		bottomPanelDisplay = null;
	}

	return (
		<section className={ styles.sectionWrapper }>
			<div className={ styles.searchWrapper }>
				<DebouncedSearch
					callback={ handleSearch }
					placeholder="Search for a feature"
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
