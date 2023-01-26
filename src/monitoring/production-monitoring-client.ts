import {
	AdditionalLogDetails,
	AnalyticsClient,
	EventName,
	EventProperties,
	LoggerClient,
	LoggingApiClient as LoggerApiClient,
	LoggingPayload,
	MonitoringClient,
} from './types';

class ProducutionLoggerClient implements LoggerClient {
	private client: LoggerApiClient;
	constructor( client: LoggerApiClient ) {
		this.client = client;
	}

	private logFailureToConsole( error: Error, originalLogPayload: LoggingPayload ): void {
		const logError = console.error || console.log;
		logError( `Logging failed with error: ${ error.message }` );
		logError( 'Original log payload: ', originalLogPayload );
	}

	debug( message: string, additionalDetails?: AdditionalLogDetails ): void {
		// Don't cache this as a private member variable because we want people to be able to change it at runtime.
		if ( ! globalThis.enableDebugLogging ) {
			return;
		}

		const log = console.debug || console.log;
		log( message, additionalDetails || '' );
	}

	info( message: string, additionalDetails?: AdditionalLogDetails ): void {
		const logPayload: LoggingPayload = {
			feature: 'bugomattic_client',
			severity: 'info',
			message,
			properties: additionalDetails,
		};
		this.client.log( logPayload ).catch( ( error ) => {
			this.logFailureToConsole( error, logPayload );
		} );
	}

	error( message: string, additionalDetails?: AdditionalLogDetails ): void {
		const logPayload: LoggingPayload = {
			feature: 'bugomattic_client',
			severity: 'error',
			message,
			properties: additionalDetails,
		};
		this.client.log( logPayload ).catch( ( error ) => {
			this.logFailureToConsole( error, logPayload );
		} );
	}
}

class ProductionAnalyticsClient implements AnalyticsClient {
	private userRole: string;
	constructor() {
		globalThis._tkq = globalThis._tkq || [];
		this.userRole = globalThis.userRole;
	}

	recordEvent( eventName: EventName, properties?: EventProperties ): void {
		if ( ! properties ) {
			properties = {};
		}
		properties.user_role = this.userRole;
		globalThis._tkq?.push( [ 'recordEvent', eventName, properties ] );
	}
}

export function createProductionMonitoringClient(
	loggerApiClient: LoggerApiClient
): MonitoringClient {
	return {
		logger: new ProducutionLoggerClient( loggerApiClient ),
		analytics: new ProductionAnalyticsClient(),
	};
}
