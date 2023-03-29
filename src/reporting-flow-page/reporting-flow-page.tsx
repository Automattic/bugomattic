import React, { useCallback } from 'react';
import { FeatureSelectionStep } from './sub-components/feature-selection-step';
import { NextStepsStep } from './sub-components/next-steps-step';
import { TypeTitleStep } from './sub-components/type-title-step';
import styles from './reporting-flow-page.module.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectIssueType } from '../issue-details/issue-details-slice';
import { ActiveReportingStep } from './types';
import { setActiveReportingStep } from './active-reporting-step-slice';
import { updateHistoryWithState } from '../url-history/actions';
import { StartOverCard } from '../start-over/start-over-card';
import { setActivePage } from '../active-page/active-page-slice';
import { selectReportingConfigLoadError } from '../static-data/reporting-config/reporting-config-slice';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { AppErrorDisplay } from '../errors/app-error-display';

export function ReportingFlowPage() {
	const configLoadError = useAppSelector( selectReportingConfigLoadError );
	const monitoringClient = useMonitoring();

	if ( configLoadError ) {
		monitoringClient.logger.error( 'Error occurred when loading the reporting config', {
			error: configLoadError,
		} );
		return <AppErrorDisplay />;
	}

	return <ReportingFlow />;
}

function ReportingFlow() {
	const dispatch = useAppDispatch();
	const issueType = useAppSelector( selectIssueType );

	const handleFeatureSelectionNextStep = useCallback( () => {
		const titleTypeStepIsComplete = issueType !== 'unset';
		const nextStep: ActiveReportingStep = titleTypeStepIsComplete ? 'nextSteps' : 'typeTitle';
		dispatch( setActiveReportingStep( nextStep ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch, issueType ] );

	const handleTypeTitleNextStep = useCallback( () => {
		dispatch( setActiveReportingStep( 'nextSteps' ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch ] );

	const handleGoToDuplicateSearchClick = () => {
		dispatch( setActivePage( 'duplicateSearching' ) );
		dispatch( updateHistoryWithState() );
	};

	return (
		<section className={ styles.flowContainer }>
			<h2 className="screenReaderOnly">Report a new issue</h2>
			{ /* Not the real button, just a placeholder, probably should be a button styled link, etc. */ }
			<button style={ { marginBottom: '1rem' } } onClick={ handleGoToDuplicateSearchClick }>
				Go to duplicate searching
			</button>
			<FeatureSelectionStep stepNumber={ 1 } goToNextStep={ handleFeatureSelectionNextStep } />
			<TypeTitleStep stepNumber={ 2 } goToNextStep={ handleTypeTitleNextStep } />
			<NextStepsStep stepNumber={ 3 } />
			<StartOverCard />
		</section>
	);
}
