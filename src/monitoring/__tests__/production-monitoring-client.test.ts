/* eslint-disable testing-library/no-debugging-utils */
import { createProductionMonitoringClient } from '../production-monitoring-client';

describe( '[ProductionMonitoringClient]', () => {
	const userRole = 'Code Wrangling';
	function setup() {
		// Reset these global variables so they can be manipulated in tests.
		delete globalThis._tkq;
		delete globalThis.enableDebugLogging;

		// This can stay constant for all tests.
		globalThis.userRole = userRole;

		const mockConsole = {
			debug: jest.spyOn( console, 'debug' ).mockImplementation( () => {
				return;
			} ),
			log: jest.spyOn( console, 'log' ).mockImplementation( () => {
				return;
			} ),
			error: jest.spyOn( console, 'error' ).mockImplementation( () => {
				return;
			} ),
		};

		const mockLoggingApiClient = {
			log: jest.fn( () => Promise.resolve() ),
		};
		const productionMonitoringClient = createProductionMonitoringClient( mockLoggingApiClient );

		return {
			mockLoggingApiClient,
			mockConsole,
			productionMonitoringClient,
		};
	}

	describe( 'Logger', () => {
		test( 'debug() should not log when enableDebugLogging is undefined', () => {
			const { productionMonitoringClient, mockConsole } = setup();

			productionMonitoringClient.logger.debug( 'This is a debug message' );
			expect( mockConsole.debug ).not.toHaveBeenCalled();
		} );

		test( 'debug() should not log when enableDebugLogging is false', () => {
			const { productionMonitoringClient, mockConsole } = setup();
			globalThis.enableDebugLogging = false;

			productionMonitoringClient.logger.debug( 'This is a debug message' );
			expect( mockConsole.debug ).not.toHaveBeenCalled();
		} );

		test( 'debug() should write to console when enableDebugLogging is true', () => {
			const { productionMonitoringClient, mockConsole } = setup();
			globalThis.enableDebugLogging = true;

			const message = 'This is a debug message';
			const properties = { foo: 'bar' };
			productionMonitoringClient.logger.debug( message, properties );
			expect( mockConsole.debug ).toHaveBeenCalledWith( message, properties );
		} );

		test( 'info() should log to the API with the correct payload', () => {
			const { productionMonitoringClient, mockLoggingApiClient } = setup();

			const message = 'This is an info message';
			const properties = { foo: 'bar' };
			productionMonitoringClient.logger.info( message, properties );
			expect( mockLoggingApiClient.log ).toHaveBeenCalledWith( {
				feature: 'bugomattic_client',
				severity: 'info',
				message,
				properties,
			} );
		} );

		test( 'If the logging API fails for info(), it should log the error and original log', async () => {
			const { productionMonitoringClient, mockLoggingApiClient, mockConsole } = setup();

			let resolveErrorCallPromise = () => {
				return;
			};
			const errorCallPromise = new Promise< void >( ( resolve ) => {
				resolveErrorCallPromise = resolve;
			} );

			mockConsole.error.mockImplementationOnce( () => resolveErrorCallPromise() );

			const errorMessage = 'API Error';
			mockLoggingApiClient.log.mockImplementationOnce( async () => {
				throw new Error( errorMessage );
			} );

			const message = 'This is an info message';
			const properties = { foo: 'bar' };
			productionMonitoringClient.logger.info( message, properties );

			await errorCallPromise;

			expect( mockConsole.error ).toHaveBeenCalledWith(
				`Logging failed with error: ${ errorMessage }`
			);
			expect( mockConsole.log ).toHaveBeenCalledWith( 'Original log payload: ', {
				feature: 'bugomattic_client',
				severity: 'info',
				message,
				properties,
			} );
		} );

		test( 'error() should log to the API with the correct payload', () => {
			const { productionMonitoringClient, mockLoggingApiClient } = setup();

			const message = 'This is an error message';
			const properties = { foo: 'bar' };
			productionMonitoringClient.logger.error( message, properties );
			expect( mockLoggingApiClient.log ).toHaveBeenCalledWith( {
				feature: 'bugomattic_client',
				severity: 'error',
				message,
				properties,
			} );
		} );

		test( 'If the logging API fails for error(), it should log the error and original log', async () => {
			const { productionMonitoringClient, mockLoggingApiClient, mockConsole } = setup();

			let resolveErrorCallPromise = () => {
				return;
			};
			const errorCallPromise = new Promise< void >( ( resolve ) => {
				resolveErrorCallPromise = resolve;
			} );

			mockConsole.error.mockImplementationOnce( () => resolveErrorCallPromise() );

			const errorMessage = 'API Error';
			mockLoggingApiClient.log.mockImplementationOnce( async () => {
				throw new Error( errorMessage );
			} );

			const message = 'This is an error message';
			const properties = { foo: 'bar' };
			productionMonitoringClient.logger.error( message, properties );

			await errorCallPromise;

			expect( mockConsole.error ).toHaveBeenCalledWith(
				`Logging failed with error: ${ errorMessage }`
			);
			expect( mockConsole.log ).toHaveBeenCalledWith( 'Original log payload: ', {
				feature: 'bugomattic_client',
				severity: 'error',
				message,
				properties,
			} );
		} );
	} );
} );
