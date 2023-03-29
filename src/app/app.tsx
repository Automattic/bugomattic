import React, { ReactNode, useEffect } from 'react';
import { AppHeader } from '../app-header/app-header';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { useInitialStateFromUrl } from '../url-history/hooks';
import styles from './app.module.css';
import { AppErrorBoundary } from '../errors/app-error-boundary';
import { useAppDataLoad } from './use-app-data';
import { selectActivePage } from '../page/active-page-slice';
import { useAppSelector } from './hooks';
import { DuplicateSearchingPage } from '../duplicate-searching/duplicate-searching-page';
import { ReportingFlowPage } from '../reporting-flow-page/reporting-flow-page';

export function App() {
	useAppDataLoad();
	const monitoringClient = useMonitoring();
	useInitialStateFromUrl();
	const activePage = useAppSelector( selectActivePage );

	useEffect( () => {
		monitoringClient.analytics.recordEvent( 'page_view' );
	}, [ monitoringClient.analytics ] );

	let mainDisplay: ReactNode;
	if ( activePage === 'duplicateSearching' ) {
		mainDisplay = <DuplicateSearchingPage />;
	} else {
		mainDisplay = <ReportingFlowPage />;
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
