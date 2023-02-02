import React from 'react';
import { FeatureSelectionStep } from './sub-components/feature-selection-step';
import { NextStepsStep } from './sub-components/next-steps-step';
import { TitleAndTypeStep } from './sub-components/title-and-type-step';
import styles from './reporting-flow.module.css';
import { useAppSelector } from '../app/hooks';
import { selectIssueType } from '../issue-details/issue-details-slice';
import { ActiveStep } from './types';

export function ReportingFlow() {
	const issueType = useAppSelector( selectIssueType );

	const titleTypeStepIsComplete = issueType !== 'unset';
	const featureSelectionNextStep: ActiveStep = titleTypeStepIsComplete
		? 'nextSteps'
		: 'titleAndType';

	const titleAndTypeNextStep: ActiveStep = 'nextSteps';

	return (
		<section className={ styles.flowContainer }>
			<h2 className="screenReaderOnly">Report a new issue</h2>
			<FeatureSelectionStep stepNumber={ 1 } nextStep={ featureSelectionNextStep } />
			<TitleAndTypeStep stepNumber={ 2 } nextStep={ titleAndTypeNextStep } />
			<NextStepsStep stepNumber={ 3 } />
		</section>
	);
}
