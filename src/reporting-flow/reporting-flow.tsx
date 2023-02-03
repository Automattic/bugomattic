import React, { useCallback } from 'react';
import { FeatureSelectionStep } from './sub-components/feature-selection-step';
import { NextStepsStep } from './sub-components/next-steps-step';
import { TitleAndTypeStep } from './sub-components/title-and-type-step';
import styles from './reporting-flow.module.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectIssueType } from '../issue-details/issue-details-slice';
import { ActiveStep } from './types';
import { setActiveStep } from './active-step-slice';
import { updateHistoryWithState } from '../url-history/actions';

export function ReportingFlow() {
	const dispatch = useAppDispatch();
	const issueType = useAppSelector( selectIssueType );

	const handleFeatureSelectionNextStep = useCallback( () => {
		const titleTypeStepIsComplete = issueType !== 'unset';
		const nextStep: ActiveStep = titleTypeStepIsComplete ? 'nextSteps' : 'titleAndType';
		dispatch( setActiveStep( nextStep ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch, issueType ] );

	const handleTitleAndTypeNextStep = useCallback( () => {
		dispatch( setActiveStep( 'nextSteps' ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch ] );

	return (
		<section className={ styles.flowContainer }>
			<h2 className="screenReaderOnly">Report a new issue</h2>
			<FeatureSelectionStep stepNumber={ 1 } goToNextStep={ handleFeatureSelectionNextStep } />
			<TitleAndTypeStep stepNumber={ 2 } goToNextStep={ handleTitleAndTypeNextStep } />
			<NextStepsStep stepNumber={ 3 } />
		</section>
	);
}
