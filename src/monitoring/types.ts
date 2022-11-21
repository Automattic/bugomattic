interface AdditionalLogDetails {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[ key: string ]: any;
}

interface LogFunction {
	( message: string, additionalDetails?: AdditionalLogDetails ): void;
}

interface EventProperties {
	[ key: string ]: number | string;
}

export interface MonitoringClient {
	logger: LoggerClient;
	analytics: AnalyticsClient;
}

export interface LoggerClient {
	debug: LogFunction;
	info: LogFunction;
	error: LogFunction;
}

export interface AnalyticsClient {
	recordEvent( eventName: string, properties?: EventProperties ): void;
}
