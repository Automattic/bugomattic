import { createSelector } from '@reduxjs/toolkit';
import { selectActiveReportingStep } from '../reporting-flow-page/active-reporting-step-slice';
import { selectIssueFeatureId } from '../issue-details/issue-details-slice';

export const selectNextReportingStep = createSelector(
	[ selectActiveReportingStep, selectIssueFeatureId ],
	( currentActiveStep, issueFeatureId ) => {
		if ( currentActiveStep === 'feature' || currentActiveStep === 'next-steps' ) {
			return 'next-steps';
		}

		// We are on the first step - selecting issue type
		if ( issueFeatureId ) {
			return 'next-steps';
		}

		return 'feature';
	}
);
