export interface AdditionalLogDetails {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[ key: string ]: any;
}

export interface LogFunction {
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
	| 'feature_select'
	| 'feature_clear'
	| 'feature_search'
	| 'feature_save'
	| 'issue_search'
	| 'type_save'
	| 'feature_step_edit'
	| 'type_step_edit'
	| 'task_complete'
	| 'task_complete_all'
	| 'task_link_click'
	| 'more_info_link_click'
	| 'start_over_click';

export interface LogPayload {
	feature: 'bugomattic_client';
	severity: 'info' | 'error';
	message: string;
	properties?: AdditionalLogDetails;
}

export interface LoggerApiClient {
	log( payload: LogPayload ): Promise< void >;
}
