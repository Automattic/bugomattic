import React, { ReactNode } from 'react';
import { AppHeader } from '../app-header/app-header';
import { ReportingConfigLoadingIndicator } from '../reporting-config/reporting-config-loading-indicator';
import { useReportingConfigLoad } from '../reporting-config/use-reporting-config';
import { ReportingFlow } from '../reporting-flow/reporting-flow';
import styles from './app.module.css';

export function App() {
	const reportingConfigLoadStatus = useReportingConfigLoad();

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
		<div className={ styles.appMain }>
			<AppHeader />
			<main className={ styles.appMain }>{ mainDisplay }</main>
		</div>
	);
}
