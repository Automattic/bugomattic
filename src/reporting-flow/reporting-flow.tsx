import React from 'react';
import { FeatureSelectionStep } from './sub-components/feature-selection-step';
import { NextStepsStep } from './sub-components/next-steps-step';
import { TitleAndTypeStep } from './sub-components/title-and-type-step';
import styles from './reporting-flow.module.css';

export function ReportingFlow() {
	return (
		<section className={ styles.flowContainer }>
			<h2 className="screenReaderOnly">Report a new issue</h2>
			<FeatureSelectionStep />
			<TitleAndTypeStep />
			<NextStepsStep />
		</section>
	);
}
