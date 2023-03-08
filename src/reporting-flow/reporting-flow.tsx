import React, { useCallback } from 'react';
import { FeatureSelectionStep } from './sub-components/feature-selection-step';
import { NextStepsStep } from './sub-components/next-steps-step';
import { TypeTitleStep } from './sub-components/type-title-step';
import styles from './reporting-flow.module.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectIssueType } from '../issue-details/issue-details-slice';
import { ActiveStep } from './types';
import { setActiveStep } from './active-step-slice';
import { updateHistoryWithState } from '../url-history/actions';
import { StartOverCard } from '../start-over/start-over-card';

export function ReportingFlow() {
	const dispatch = useAppDispatch();
	const issueType = useAppSelector( selectIssueType );

	const handleFeatureSelectionNextStep = useCallback( () => {
		const titleTypeStepIsComplete = issueType !== 'unset';
		const nextStep: ActiveStep = titleTypeStepIsComplete ? 'nextSteps' : 'typeTitle';
		dispatch( setActiveStep( nextStep ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch, issueType ] );

	const handleTypeTitleNextStep = useCallback( () => {
		dispatch( setActiveStep( 'nextSteps' ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch ] );

	return (
		<section className={ styles.flowContainer }>
			<h2 className="screenReaderOnly">Report a new issue</h2>
			<FeatureSelectionStep stepNumber={ 1 } goToNextStep={ handleFeatureSelectionNextStep } />
			<TypeTitleStep stepNumber={ 2 } goToNextStep={ handleTypeTitleNextStep } />
			<NextStepsStep stepNumber={ 3 } />
			<StartOverCard />
		</section>
	);
}
