import React, { ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import { AppErrorDisplay } from '../errors/app-error-display';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { ReportingConfigLoadingIndicator } from './sub-components/reporting-config-loading-indicator';
import {
	selectReportingConfigLoadError,
	selectReportingConfigLoadStatus,
} from '../static-data/reporting-config/reporting-config-slice';
import { ReportingFlow } from './reporting-flow';

export function ReportingFlowPage() {
	const loadStatus = useAppSelector( selectReportingConfigLoadStatus );
	const loadError = useAppSelector( selectReportingConfigLoadError );
	const monitoringClient = useMonitoring();

	let display: ReactNode;
	if ( loadStatus === 'empty' || loadStatus === 'loading' ) {
		display = <ReportingConfigLoadingIndicator />;
	} else if ( loadStatus === 'loaded' ) {
		display = <ReportingFlow />;
	} else {
		monitoringClient.logger.error( 'Error occurred when loading the reporting config', {
			error: loadError,
		} );
		display = <AppErrorDisplay />;
	}

	return <>{ display }</>;
}
