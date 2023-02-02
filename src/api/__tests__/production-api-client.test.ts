import { ProductionApiClient } from '../production-api-client';
import { createServer, Request, Response } from 'miragejs';
import { ReportingConfigApiResponse } from '../types';
import { LogPayload } from '../../monitoring/types';

describe( '[ProductionApiClient]', () => {
	const fakeNonce = 'abc123';
	const fakeNonceHeaderName = 'x-fake-nonce';

	const fakeReportingConfig: ReportingConfigApiResponse = {
		foo: {
			description: 'bar',
		},
	};

	let server: ReturnType< typeof createServer >;

	// Normally we use the "setup" pattern, but we need to teardown the server after each test.
	// So we're using "beforeEach" and "afterEach" instead.
	beforeEach( () => {
		globalThis.nonce = fakeNonce;
		globalThis.nonceHeaderName = fakeNonceHeaderName;

		server = createServer( {
			environment: 'test',
			trackRequests: true,
			routes() {
				this.namespace = 'wp-json/bugomattic/v1';

				this.get( '/reporting-config', () => {
					return fakeReportingConfig;
				} );

				// We could make a fake DB schema for logs, but that's a bit overkill here.
				this.post( '/logs', () => {
					return new Response( 200 );
				} );
			},
		} );
	} );

	afterEach( () => {
		server.shutdown();
	} );

	describe( 'loadReportingConfig()', () => {
		test( 'Calls the correct endpoint and returns the reporting config', async () => {
			const apiClient = new ProductionApiClient();
			const reportingConfig = await apiClient.loadReportingConfig();

			// If this returns correctly, we called the correct endpoint.
			expect( reportingConfig ).toEqual( fakeReportingConfig );
		} );

		test( 'The request includes the nonce in the right header', async () => {
			const apiClient = new ProductionApiClient();
			await apiClient.loadReportingConfig();

			// The types are borked here, see: https://github.com/pretenderjs/pretender/pull/353
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const lastRequest: Request = ( server.pretender as any ).handledRequests[ 0 ];
			expect( lastRequest.requestHeaders[ fakeNonceHeaderName ] ).toEqual( fakeNonce );
		} );

		test( 'Throws an error if the request fails', async () => {
			const apiClient = new ProductionApiClient();

			const errorBody = {
				error: 'Something went wrong',
			};

			server.get( '/reporting-config', () => {
				return new Response( 500, {}, errorBody );
			} );

			await expect( apiClient.loadReportingConfig() ).rejects.toThrowError(
				`Load Reporting Config web request failed with status code 500. Response body: ${ JSON.stringify(
					errorBody
				) }`
			);
		} );
	} );

	describe( 'log()', () => {
		const fakeLogPayload: LogPayload = {
			feature: 'bugomattic_client',
			severity: 'info',
			message: 'This is a test',
		};

		test( 'Calls the correct endpoint', async () => {
			const apiClient = new ProductionApiClient();
			await expect( apiClient.log( fakeLogPayload ) ).resolves.not.toThrowError();
		} );

		test( 'The request includes the nonce in the right header', async () => {
			const apiClient = new ProductionApiClient();
			await apiClient.log( fakeLogPayload );

			// The types are borked here, see: https://github.com/pretenderjs/pretender/pull/353
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const lastRequest: Request = ( server.pretender as any ).handledRequests[ 0 ];
			expect( lastRequest.requestHeaders[ fakeNonceHeaderName ] ).toEqual( fakeNonce );
		} );

		test( 'The request includes the log payload in the body', async () => {
			const apiClient = new ProductionApiClient();
			await apiClient.log( fakeLogPayload );

			// The types are borked here, see: https://github.com/pretenderjs/pretender/pull/353
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const lastRequest: Request = ( server.pretender as any ).handledRequests[ 0 ];
			expect( JSON.parse( lastRequest.requestBody ) ).toEqual( fakeLogPayload );
		} );

		test( 'Throws an error if the request fails', async () => {
			const apiClient = new ProductionApiClient();

			const errorBody = {
				error: 'Invalid request',
			};

			server.post( '/logs', () => {
				return new Response( 400, {}, errorBody );
			} );

			await expect( apiClient.log( fakeLogPayload ) ).rejects.toThrowError(
				`Log web request failed with status code 400. Response body: ${ JSON.stringify(
					errorBody
				) }`
			);
		} );
	} );
} );
