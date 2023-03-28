import React, { ReactNode, useEffect } from 'react';
import { AppHeader } from '../app-header/app-header';
import { AppErrorDisplay } from '../errors/app-error-display';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { ReportingConfigLoadingIndicator } from '../reporting-config/reporting-config-loading-indicator';
import { useReportingConfigLoad } from '../reporting-config/use-reporting-config';
import { ReportingFlow } from '../reporting-flow-page/reporting-flow-page';
import { useInitialStateFromUrl } from '../url-history/hooks';
import styles from './app.module.css';
import { AppErrorBoundary } from '../errors/app-error-boundary';

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
		mainDisplay = <AppErrorDisplay />;
	}

	return (
		<div className={ styles.appMain }>
			<AppHeader />
			<AppErrorBoundary>
				<main className={ styles.appMain }>{ mainDisplay }</main>
			</AppErrorBoundary>
		</div>
	);
}
