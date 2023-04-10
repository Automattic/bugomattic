import React, { ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectIssueType } from '../../issue-details/issue-details-slice';
import { IssueType } from '../../issue-details/types';
import { TypeForm } from '../../type-form/type-form';
import { selectActiveReportingStep, setActiveReportingStep } from '../active-reporting-step-slice';
import { StepContainer } from './step-container';
import styles from '../reporting-flow-page.module.css';
import { updateHistoryWithState } from '../../url-history/actions';
import { useMonitoring } from '../../monitoring/monitoring-provider';

interface Props {
	stepNumber: number;
	goToNextStep: () => void;
}

export function TypeStep( { stepNumber, goToNextStep }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const activeStep = useAppSelector( selectActiveReportingStep );
	const issueType = useAppSelector( selectIssueType );

	const onEdit = useCallback( () => {
		dispatch( setActiveReportingStep( 'type' ) );
		dispatch( updateHistoryWithState() );
		monitoringClient.analytics.recordEvent( 'type_step_edit' );
	}, [ dispatch, monitoringClient.analytics ] );

	const isActive = activeStep === 'type';
	const isComplete = issueType !== 'unset' && ! isActive;

	let stepContentDisplay: ReactNode;
	if ( isActive ) {
		stepContentDisplay = <TypeForm onContinue={ goToNextStep } />;
	} else if ( isComplete ) {
		stepContentDisplay = <CompletedStep type={ issueType } />;
	} else {
		stepContentDisplay = null;
	}

	return (
		<StepContainer
			title="Type"
			stepNumber={ stepNumber }
			isComplete={ isComplete }
			showEditButton={ isComplete }
			onEdit={ onEdit }
		>
			{ stepContentDisplay }
		</StepContainer>
	);
}

interface CompletedStepProps {
	type: IssueType;
}

function CompletedStep( { type }: CompletedStepProps ) {
	return (
		<div>
			<div className={ styles.completedContentWrapper }>
				<h4 className={ styles.completedContentHeader }>Type</h4>
				<p className={ styles.completedContentValue }>{ getDisplayTextForType( type ) }</p>
			</div>
		</div>
	);
}

function getDisplayTextForType( type: IssueType ) {
	switch ( type ) {
		case 'urgent':
			return "It's Urgent!";
		case 'bug':
			return 'Bug';
		case 'featureRequest':
			return 'Feature Request';
		default:
			return 'No type set';
	}
}
