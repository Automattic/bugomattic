export interface AdditionalLogDetails {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[ key: string ]: any;
}

interface LogFunction {
	( message: string, additionalDetails?: AdditionalLogDetails ): void;
}

export interface EventProperties {
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
	recordEvent( eventName: EventName, properties?: EventProperties ): void;
}

export type EventName =
	| 'page_view'
	| 'feature_search'
	| 'feature_save'
	| 'title_save'
	| 'type_save'
	| 'feature_step_edit'
	| 'type_step_edit'
	| 'task_complete'
	| 'task_complete_all'
	| 'task_link_click'
	| 'more_info_link_click';

export interface LoggingPayload {
	feature: 'bugomattic_client';
	severity: 'info' | 'error';
	message: string;
	properties?: AdditionalLogDetails;
}

export interface LoggingApiClient {
	log( payload: LoggingPayload ): Promise< void >;
}
