import React, { ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectIssueFeatureId } from '../issue-details/issue-details-slice';
import { selectNormalizedReportingConfig } from '../reporting-config/reporting-config-slice';
import { TitleTypeForm } from '../title-type-form/title-type-form';
import { selectActiveStep, setActiveStep } from './active-step-slice';
import { StepContainer } from './step-container';
import styles from './reporting-flow.module.css';

export function ProductAndFeatureStep() {
	const dispatch = useAppDispatch();
	const activeStep = useAppSelector( selectActiveStep );
	const issueFeatureId = useAppSelector( selectIssueFeatureId );

	const onEdit = useCallback(
		() => dispatch( setActiveStep( 'productAndFeature' ) ),
		[ dispatch ]
	);

	const isActive = activeStep === 'productAndFeature';
	const isComplete = issueFeatureId !== null && ! isActive;

	let stepContentDisplay: ReactNode;
	if ( isActive ) {
		stepContentDisplay = <TitleTypeForm />;
	} else if ( isComplete ) {
		stepContentDisplay = <CompletedStep featureId={ issueFeatureId } />;
	} else {
		stepContentDisplay = null;
	}

	return (
		<StepContainer
			title="Product and Feature"
			stepNumber={ 2 }
			isComplete={ isComplete }
			showEditButton={ ! isActive }
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
			<h3 className={ styles.completedContentHeader }>Product and Feature</h3>
			<p className={ styles.completedContentValue }>{ breadcrumbPieces.join( ' > ' ) }</p>
		</div>
	);
}
