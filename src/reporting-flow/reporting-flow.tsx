import React from 'react';
import { FeatureSelectionStep } from './feature-selection-step';
import { NextStepsStep } from './next-steps-step';
import { TitleAndTypeStep } from './title-and-type-step';
import styles from './reporting-flow.module.css';

export function ReportingFlow() {
	return (
		<section className={ styles.flowContainer }>
			<h2 className="screenReaderOnly">Report a new issue</h2>
			<TitleAndTypeStep />
			<FeatureSelectionStep />
			<NextStepsStep />
		</section>
	);
}
