import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { AppErrorDisplay } from './app-error-display';

interface Props {
	children: ReactNode;
}

export function AppErrorBoundary( { children }: Props ) {
	const monitoringClient = useMonitoring();

	const handleAppError = ( error: Error, info: { componentStack: string } ) => {
		monitoringClient.logger.error( 'Unexpected app error occurred', {
			error: error,
			componentStack: info.componentStack,
		} );
	};

	return (
		<ErrorBoundary FallbackComponent={ AppErrorDisplay } onError={ handleAppError }>
			{ children }
		</ErrorBoundary>
	);
}
