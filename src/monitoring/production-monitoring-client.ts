import { AnalyticsClient, LoggerClient, MonitoringClient } from './types';

const productionLogger: LoggerClient = {
	debug: ( message, additionalDetails? ) => {
		throw new Error( 'Not implemented' );
	},
	info: ( message, additionalDetails? ) => {
		throw new Error( 'Not implemented' );
	},
	error: ( message, additionalDetails? ) => {
		throw new Error( 'Not implemented' );
	},
};

const productionAnalytics: AnalyticsClient = {
	recordEvent: ( eventName, properties? ) => {
		throw new Error( 'Not implemented' );
	},
};

export const productionMonitoringClient: MonitoringClient = {
	logger: productionLogger,
	analytics: productionAnalytics,
};
