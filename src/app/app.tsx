import React, { useEffect } from 'react';
import { AppHeader } from '../app-header/app-header';
import { useMonitoring } from '../monitoring/monitoring-provider';
import styles from './app.module.css';
import { AppErrorBoundary } from '../errors/app-error-boundary';
import { selectActivePage } from '../active-page/active-page-slice';
import { useAppSelector } from './hooks';
import { DuplicateSearchingPage } from '../duplicate-searching-page/duplicate-searching-page';
import { ReportingFlowPage } from '../reporting-flow-page/reporting-flow-page';
import { useAppDataHydration } from './use-app-data-hydration';
import { AppLoadingIndicator } from './app-loading-indicator';

export function App() {
	const monitoringClient = useMonitoring();
	useEffect( () => {
		monitoringClient.analytics.recordEvent( 'page_view' );
	}, [ monitoringClient.analytics ] );

	return (
		<div className={ styles.appMain }>
			<AppHeader />
			<AppErrorBoundary>
				<main className={ styles.appMain }>
					<MainDisplay />
				</main>
			</AppErrorBoundary>
		</div>
	);
}

function MainDisplay() {
	// Doing all the main data hydration here so any truly unexpected errors (should be extremely rare!) bubble up to the error boundary.
	// In general though, all we care about here is whether they hydration is done or not.
	// We defer any expected error handling (e.g. request failure, bad configuration) to the child components.
	// This allows as much of the app to be usable as possible, even if some parts are not working.
	const ready = useAppDataHydration();
	const activePage = useAppSelector( selectActivePage );

	if ( ! ready ) {
		return <AppLoadingIndicator />;
	}

	if ( activePage === 'duplicateSearching' ) {
		return <DuplicateSearchingPage />;
	}

	return <ReportingFlowPage />;
}
