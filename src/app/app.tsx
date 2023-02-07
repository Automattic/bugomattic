import React, { ReactNode, useEffect } from 'react';
import { AppHeader } from '../app-header/app-header';
import { AppError } from '../errors/app-error';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { ReportingConfigLoadingIndicator } from '../reporting-config/reporting-config-loading-indicator';
import { useReportingConfigLoad } from '../reporting-config/use-reporting-config';
import { ReportingFlow } from '../reporting-flow/reporting-flow';
import { useInitialStateFromUrl } from '../url-history/hooks';
import { ErrorBoundary } from 'react-error-boundary';
import styles from './app.module.css';

export function App() {
	const { loadStatus, error } = useReportingConfigLoad();
	const monitoringClient = useMonitoring();
	useInitialStateFromUrl();

	useEffect( () => {
		monitoringClient.analytics.recordEvent( 'page_view' );
	}, [ monitoringClient.analytics ] );

	let mainDisplay: ReactNode;
	if ( loadStatus === 'empty' || loadStatus === 'loading' ) {
		mainDisplay = <ReportingConfigLoadingIndicator />;
	} else if ( loadStatus === 'loaded' ) {
		mainDisplay = <ReportingFlow />;
	} else {
		monitoringClient.logger.error( 'Error occurred when loading the reporting config', {
			error: error,
		} );
		mainDisplay = <AppError />;
	}

	const handleAppError = ( error: Error, info: { componentStack: string } ) => {
		monitoringClient.logger.error( 'Unexpected app error occurred', {
			error: error,
			componentStack: info.componentStack,
		} );
	};

	return (
		<div className={ styles.appMain }>
			<AppHeader />
			<ErrorBoundary FallbackComponent={ AppError } onError={ handleAppError }>
				<main className={ styles.appMain }>{ mainDisplay }</main>
			</ErrorBoundary>
		</div>
	);
}
