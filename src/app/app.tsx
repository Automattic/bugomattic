import React, { ReactNode, useEffect } from 'react';
import { AppHeader } from '../app-header/app-header';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { useInitialStateFromUrl } from '../url-history/hooks';
import styles from './app.module.css';
import { AppErrorBoundary } from '../errors/app-error-boundary';
import { useStaticDataLoad } from '../static-data/use-static-data';
import { selectActivePage } from '../active-page/active-page-slice';
import { useAppSelector } from './hooks';
import { DuplicateSearchingPage } from '../duplicate-searching-page/duplicate-searching-page';
import { ReportingFlowPage } from '../reporting-flow-page/reporting-flow-page';

export function App() {
	useStaticDataLoad();
	useInitialStateFromUrl();

	const monitoringClient = useMonitoring();
	useEffect( () => {
		monitoringClient.analytics.recordEvent( 'page_view' );
	}, [ monitoringClient.analytics ] );

	const activePage = useAppSelector( selectActivePage );

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
