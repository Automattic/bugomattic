import { AnalyticsClient, LoggerClient, MonitoringClient } from './types';

const localLogger: LoggerClient = {
	debug: ( message, additionalDetails? ) => console.debug( message, additionalDetails || '' ),
	info: ( message, additionalDetails? ) => console.info( message, additionalDetails || '' ),
	error: ( message, additionalDetails? ) => console.error( message, additionalDetails || '' ),
};

const localAnalytics: AnalyticsClient = {
	recordEvent: ( eventName, properties? ) =>
		console.log( `[Event recorded]: ${ eventName }`, properties || '' ),
};

export const localMonitoringClient: MonitoringClient = {
	logger: localLogger,
	analytics: localAnalytics,
};
