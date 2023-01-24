import React, { ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectIssueTitle, selectIssueType } from '../../issue-details/issue-details-slice';
import { IssueType } from '../../issue-details/types';
import { TitleTypeForm } from '../../title-type-form/title-type-form';
import { selectActiveStep, setActiveStep } from './../active-step-slice';
import { StepContainer } from './step-container';
import styles from '../reporting-flow.module.css';

interface Props {
	stepNumber: number;
	goToNextStep: () => void;
}

export function TitleAndTypeStep( { stepNumber, goToNextStep }: Props ) {
	const dispatch = useAppDispatch();
	const activeStep = useAppSelector( selectActiveStep );
	const issueTitle = useAppSelector( selectIssueTitle );
	const issueType = useAppSelector( selectIssueType );

	const onEdit = useCallback( () => dispatch( setActiveStep( 'titleAndType' ) ), [ dispatch ] );

	const isActive = activeStep === 'titleAndType';
	const isComplete = issueType !== 'unset' && ! isActive;

	let stepContentDisplay: ReactNode;
	if ( isActive ) {
		stepContentDisplay = <TitleTypeForm onContinue={ goToNextStep } />;
	} else if ( isComplete ) {
		stepContentDisplay = <CompletedStep title={ issueTitle } type={ issueType } />;
	} else {
		stepContentDisplay = null;
	}

	return (
		<StepContainer
			title="Title and Type"
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
	title?: string;
}

function CompletedStep( { title, type }: CompletedStepProps ) {
	return (
		<div>
			{ title && (
				<div className={ styles.completedContentWrapper }>
					<h4 className={ styles.completedContentHeader }>Title</h4>
					<p className={ styles.completedContentValue }>{ title }</p>
				</div>
			) }
			<h4 className={ styles.completedContentHeader }>Type</h4>
			<p className={ styles.completedContentValue }>{ getDisplayTextForType( type ) }</p>
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
