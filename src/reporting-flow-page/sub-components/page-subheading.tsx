import React from 'react';
import { usePageNavigation } from '../../active-page/page-navigation-provider';
import { useAppSelector } from '../../app/hooks';
import { selectActiveReportingStep } from '../active-reporting-step-slice';
import { ActiveReportingStep } from '../types';

export function ReportingPageSubheading() {
	const { pageHeadingRef } = usePageNavigation();
	const activeStep = useAppSelector( selectActiveReportingStep );
	const stepDescriptionId = 'reporting-step-description';

	const friendlyStepDescriptions: { [ key in ActiveReportingStep ]: string } = {
		type: 'Select issue type',
		feature: 'Select issue feature',
		[ 'next-steps' ]: 'Next steps to report issue',
	};

	return (
		<>
			<h2
				ref={ pageHeadingRef }
				className="screenReaderOnly"
				tabIndex={ -1 }
				aria-describedby={ stepDescriptionId }
			>
				Report a new issue
			</h2>
			<span className="screenReaderOnly" id={ stepDescriptionId }>
				Current active step: { friendlyStepDescriptions[ activeStep ] }
			</span>
		</>
	);
}
