import React, { ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectIssueFeatureId } from '../../issue-details/issue-details-slice';
import { selectNormalizedReportingConfig } from '../../reporting-config/reporting-config-slice';
import { selectActiveStep, setActiveStep } from '../active-step-slice';
import { StepContainer } from './step-container';
import styles from '../reporting-flow.module.css';
import { FeatureSelectorForm } from '../../feature-selector-form/feature-selector-form';

export function FeatureSelectionStep() {
	const dispatch = useAppDispatch();
	const activeStep = useAppSelector( selectActiveStep );
	const issueFeatureId = useAppSelector( selectIssueFeatureId );

	const onEdit = useCallback( () => dispatch( setActiveStep( 'featureSelection' ) ), [ dispatch ] );

	const isActive = activeStep === 'featureSelection';
	const isComplete = issueFeatureId !== null && ! isActive;

	let stepContentDisplay: ReactNode;
	if ( isActive ) {
		stepContentDisplay = <FeatureSelectorForm />;
	} else if ( isComplete ) {
		stepContentDisplay = <CompletedStep featureId={ issueFeatureId } />;
	} else {
		stepContentDisplay = null;
	}

	return (
		<StepContainer
			title="Product and Feature"
			stepNumber={ 1 }
			isComplete={ isComplete }
			showEditButton={ isComplete }
			onEdit={ onEdit }
		>
			{ stepContentDisplay }
		</StepContainer>
	);
}

interface CompletedStepProps {
	featureId: string;
}

function CompletedStep( { featureId }: CompletedStepProps ) {
	const { products, featureGroups, features } = useAppSelector( selectNormalizedReportingConfig );
	const feature = features[ featureId ];

	let breadcrumbPieces: string[];
	if ( feature.parentType === 'product' ) {
		const product = products[ feature.parentId ];
		breadcrumbPieces = [ product.name, feature.name ];
	} else {
		const featureGroup = featureGroups[ feature.parentId ];
		const product = products[ featureGroup.productId ];
		breadcrumbPieces = [ product.name, featureGroup.name, feature.name ];
	}

	return (
		<div>
			<h4 className={ styles.completedContentHeader }>Product and Feature</h4>
			<p className={ styles.completedContentValue }>{ breadcrumbPieces.join( ' > ' ) }</p>
		</div>
	);
}
