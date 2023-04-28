import { createSelector } from '@reduxjs/toolkit';
import { selectActiveReportingStep } from '../reporting-flow-page/active-reporting-step-slice';
import { selectIssueFeatureId } from '../issue-details/issue-details-slice';

export const selectNextReportingStep = createSelector(
	[ selectActiveReportingStep, selectIssueFeatureId ],
	( currentActiveStep, issueFeatureId ) => {
		if ( currentActiveStep === 'featureSelection' || currentActiveStep === 'nextSteps' ) {
			return 'nextSteps';
		}

		// We are on the first step - selecting issue type
		if ( issueFeatureId ) {
			return 'nextSteps';
		}

		return 'featureSelection';
	}
);
