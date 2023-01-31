import React, { ReactNode, useEffect } from 'react';
import { AppHeader } from '../app-header/app-header';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { ReportingConfigLoadingIndicator } from '../reporting-config/reporting-config-loading-indicator';
import { useReportingConfigLoad } from '../reporting-config/use-reporting-config';
import { ReportingFlow } from '../reporting-flow/reporting-flow';
import styles from './app.module.css';

export function App() {
	const reportingConfigLoadStatus = useReportingConfigLoad();
	const monitoringClient = useMonitoring();

	useEffect( () => {
		monitoringClient.analytics.recordEvent( 'page_view' );
	}, [ monitoringClient.analytics ] );

	let mainDisplay: ReactNode;
	if ( reportingConfigLoadStatus === 'empty' || reportingConfigLoadStatus === 'loading' ) {
		mainDisplay = <ReportingConfigLoadingIndicator />;
	} else if ( reportingConfigLoadStatus === 'loaded' ) {
		mainDisplay = <ReportingFlow />;
	} else {
		// TODO: Add an error display of some kind.
		mainDisplay = null;
	}

	return (
		<div className={ styles.app }>
			<AppHeader />
			<main className={ styles.appMain }>{ mainDisplay }</main>
		</div>
	);
}
