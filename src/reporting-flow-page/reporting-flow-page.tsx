import React, { useCallback } from 'react';
import { FeatureSelectionStep } from './sub-components/feature-selection-step';
import { NextStepsStep } from './sub-components/next-steps-step';
import { TypeStep } from './sub-components/type-step';
import styles from './reporting-flow-page.module.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setActiveReportingStep } from './active-reporting-step-slice';
import { updateHistoryWithState } from '../url-history/actions';
import { StartOverBanner } from '../start-over/start-over-banner';
import { selectReportingConfigLoadError } from '../static-data/reporting-config/reporting-config-slice';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { AppErrorDisplay } from '../errors/app-error-display';
import { selectNextReportingStep } from '../combined-selectors/next-reporting-step';

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
	const currentExpectedNextStep = useAppSelector( selectNextReportingStep );

	const handleNextStep = useCallback( () => {
		dispatch( setActiveReportingStep( currentExpectedNextStep ) );
		dispatch( updateHistoryWithState() );
	}, [ dispatch, currentExpectedNextStep ] );

	return (
		<section className={ styles.flowContainer }>
			<h2 className="screenReaderOnly">Report a new issue</h2>
			<TypeStep stepNumber={ 1 } goToNextStep={ handleNextStep } />
			<FeatureSelectionStep stepNumber={ 2 } goToNextStep={ handleNextStep } />
			<NextStepsStep stepNumber={ 3 } />
			<StartOverBanner />
		</section>
	);
}
