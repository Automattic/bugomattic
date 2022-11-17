import React, { createContext, ReactNode, useContext } from 'react';
import { localMonitoringClient } from './local-monitoring-client';
import { MonitoringClient } from './types';

const MonitoringContext = createContext< MonitoringClient >( localMonitoringClient );

interface Props {
	monitoringClient: MonitoringClient;
	children: ReactNode;
}

export function MonitoringProvider( { monitoringClient, children }: Props ) {
	return (
		<MonitoringContext.Provider value={ monitoringClient }>{ children }</MonitoringContext.Provider>
	);
}

export function useMonitoring() {
	return useContext( MonitoringContext );
}
