import { createProductionApiClient } from '../production-api-client';
import { createServer, Request, Response } from 'miragejs';
import {
	AvailableRepoFiltersApiResponse,
	ReportingConfigApiResponse,
	SearchIssueApiResponse,
} from '../types';
import { LogPayload } from '../../monitoring/types';
import { _clearSearchIssuesCache } from '../shared-helpers/search-issues-cache';

describe( '[ProductionApiClient]', () => {
	const fakeNonce = 'abc123';
	const fakeNonceHeaderName = 'x-fake-nonce';
	const reportingConfigCacheKey = 'cachedReportingConfigData';
	const reportingConfigCacheExpiryKey = 'cacheExpiry';
	const fakeReportingConfig: ReportingConfigApiResponse = {
		foo: {
			description: 'bar',
		},
	};
	const fakeReportingConfigCached: ReportingConfigApiResponse = {
		bar: {
			description: 'foo',
		},
	};

	const fakeIssues: SearchIssueApiResponse = [
		{
			author: 'Test author',
			content: 'Test content',
			dateCreated: '2021-01-01T00:00:00Z',
			dateUpdated: '2021-01-01T00:00:00Z',
			repo: 'Automattic/bugomattic',
			status: 'open',
			title: 'Test title',
			url: 'https://github.com/Automattic/bugomattic/issues/1',
		},
	];

	const fakeRepoFilters: AvailableRepoFiltersApiResponse = [
		'Automattic/bugomattic',
		'OtherOrg/other-repo',
	];

	const repoCacheKey = 'repoFilters';
	const repoCackeExpiryKey = 'repoFiltersExpiry';

	let server: ReturnType< typeof createServer >;

	// Normally we use the "setup" pattern, but we need to teardown the server after each test.
	// So we're using "beforeEach" and "afterEach" instead.
	beforeEach( () => {
		localStorage.clear();

		globalThis.nonce = fakeNonce;
		globalThis.nonceHeaderName = fakeNonceHeaderName;
		localStorage.removeItem( reportingConfigCacheKey );

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

				this.get( '/issues', () => {
					return fakeIssues;
				} );

				this.get( '/repos', () => {
					return fakeRepoFilters;
				} );
			},
		} );
	} );

	afterEach( () => {
		server.shutdown();
	} );

	function getLastRequest(): Request {
		// The types are borked here, see: https://github.com/pretenderjs/pretender/pull/353
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return ( server.pretender as any ).handledRequests?.[ 0 ];
	}

	describe( 'loadReportingConfig()', () => {
		test( 'Calls the correct endpoint and returns the reporting config', async () => {
			const apiClient = createProductionApiClient();
			const reportingConfig = await apiClient.loadReportingConfig();

			expect( reportingConfig ).toEqual( fakeReportingConfig );

			// Assert that the data is stored in local storage
			expect( localStorage.getItem( reportingConfigCacheKey ) ).toEqual(
				JSON.stringify( fakeReportingConfig )
			);

			expect( localStorage.getItem( reportingConfigCacheExpiryKey ) ).not.toBeNull();
		} );

		test( 'The request includes the nonce in the right header', async () => {
			const apiClient = createProductionApiClient();
			await apiClient.loadReportingConfig();
			expect( getLastRequest().requestHeaders[ fakeNonceHeaderName ] ).toEqual( fakeNonce );
		} );

		test( 'Fetches the data from cache if available and not expired', async () => {
			const apiClient = createProductionApiClient();

			localStorage.setItem( reportingConfigCacheKey, JSON.stringify( fakeReportingConfigCached ) );
			localStorage.setItem( reportingConfigCacheExpiryKey, ( Date.now() + 10000 ).toString() );

			const reportingConfig = await apiClient.loadReportingConfig();

			expect( reportingConfig ).toEqual( fakeReportingConfigCached );

			expect( getLastRequest() ).toBeUndefined();
		} );

		test( 'Fetches the reporting config again if cache has expired', async () => {
			const apiClient = createProductionApiClient();

			localStorage.setItem( reportingConfigCacheKey, JSON.stringify( fakeReportingConfigCached ) );
			const cacheExpiryTime = Date.now() - 1;
			localStorage.setItem( reportingConfigCacheExpiryKey, cacheExpiryTime.toString() );

			const response = await apiClient.loadReportingConfig();

			expect( response ).toEqual( fakeReportingConfig );

			const cachedData = localStorage.getItem( reportingConfigCacheKey );
			const newCacheExpiry = localStorage.getItem( reportingConfigCacheExpiryKey );

			expect( cachedData ).toEqual( JSON.stringify( fakeReportingConfig ) );
			expect( Number( newCacheExpiry ) ).toBeGreaterThanOrEqual( Date.now() );
		} );

		test( 'Throws an error if the request fails', async () => {
			const apiClient = createProductionApiClient();

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
			const apiClient = createProductionApiClient();
			await expect( apiClient.log( fakeLogPayload ) ).resolves.not.toThrowError();
		} );

		test( 'The request includes the nonce in the right header', async () => {
			const apiClient = createProductionApiClient();
			await apiClient.log( fakeLogPayload );

			expect( getLastRequest().requestHeaders[ fakeNonceHeaderName ] ).toEqual( fakeNonce );
		} );

		test( 'The request includes the log payload in the body', async () => {
			const apiClient = createProductionApiClient();
			await apiClient.log( fakeLogPayload );

			expect( JSON.parse( getLastRequest().requestBody ) ).toEqual( fakeLogPayload );
		} );

		test( 'Throws an error if the request fails', async () => {
			const apiClient = createProductionApiClient();

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

	describe( 'searchIssues()', () => {
		beforeEach( () => {
			_clearSearchIssuesCache();
		} );

		test( 'Calls the correct endpoint and returns the issue list', async () => {
			const apiClient = createProductionApiClient();
			const issues = await apiClient.searchIssues( 'test' );

			// If this returns correctly, we called the correct endpoint.
			expect( issues ).toEqual( fakeIssues );
		} );

		test( 'The request includes the nonce in the right header', async () => {
			const apiClient = createProductionApiClient();
			await apiClient.searchIssues( 'test' );

			const lastRequest = getLastRequest();
			expect( lastRequest.requestHeaders[ fakeNonceHeaderName ] ).toEqual( fakeNonce );
		} );

		test( 'If no optional params are passed, they are not added to the request query', async () => {
			const search = 'test';
			const apiClient = createProductionApiClient();
			await apiClient.searchIssues( search );

			const lastRequest = getLastRequest();
			expect( lastRequest.queryParams.search ).toBe( search );
			expect( lastRequest.queryParams.status ).toBeUndefined();
			expect( lastRequest.queryParams.sort ).toBeUndefined();
			expect( lastRequest.queryParams[ 'repos[]' ] ).toBeUndefined();
		} );

		test( 'If optional params are passed, they are added to the request query', async () => {
			const search = 'test';
			const status = 'open';
			const sort = 'date-created';
			const repos = [ 'repo1', 'repo2' ];

			const apiClient = createProductionApiClient();
			await apiClient.searchIssues( search, { status, sort, repos } );

			const lastRequest = getLastRequest();
			expect( lastRequest.queryParams.search ).toBe( search );
			expect( lastRequest.queryParams.status ).toBe( status );
			expect( lastRequest.queryParams.sort ).toBe( sort );
			// Oh cool! This library knows how to interpret the array syntax in the query string!
			// So we don't need the "[]" in the key name.
			expect( lastRequest.queryParams[ 'repos' ] ).toEqual( repos );
		} );

		test( 'Throws an error if the request fails', async () => {
			const apiClient = createProductionApiClient();

			const errorBody = {
				error: 'Invalid search parameter',
			};

			server.get( '/issues', () => {
				return new Response( 400, {}, errorBody );
			} );

			await expect( apiClient.searchIssues( 'test' ) ).rejects.toThrowError(
				`Search Issues web request failed with status code 400. Response body: ${ JSON.stringify(
					errorBody
				) }`
			);
		} );
	} );

	describe( 'getRepoFilters()', () => {
		test( 'Calls the correct endpoint and returns the repo filters, saving to localstorage', async () => {
			const apiClient = createProductionApiClient();
			const repoFilters = await apiClient.loadAvailableRepoFilters();

			// If this returns correctly, we called the correct endpoint.
			expect( repoFilters ).toEqual( fakeRepoFilters );

			// Cache works correctly
			expect( localStorage.getItem( repoCacheKey ) ).toEqual( JSON.stringify( fakeRepoFilters ) );
			expect( localStorage.getItem( repoCackeExpiryKey ) ).not.toBeNull();
		} );

		test( 'The request includes the nonce in the right header', async () => {
			const apiClient = createProductionApiClient();
			await apiClient.loadAvailableRepoFilters();

			const lastRequest = getLastRequest();
			expect( lastRequest.requestHeaders[ fakeNonceHeaderName ] ).toEqual( fakeNonce );
		} );

		test( 'Returns the cached repo filters if they are not expired', async () => {
			const apiClient = createProductionApiClient();

			const otherRepoFilters = [ 'OtherOrg/other-repo' ];

			// Set the cache
			localStorage.setItem( repoCacheKey, JSON.stringify( otherRepoFilters ) );
			localStorage.setItem( repoCackeExpiryKey, ( Date.now() + 10000 ).toString() );

			const repoFilters = await apiClient.loadAvailableRepoFilters();

			expect( repoFilters ).toEqual( otherRepoFilters );
			expect( getLastRequest() ).toBeUndefined();
		} );

		test( 'Fetches the repo filters if the cache is expired', async () => {
			const apiClient = createProductionApiClient();

			const otherRepoFilters = [ 'OtherOrg/other-repo' ];

			// Set the expired cache
			localStorage.setItem( repoCacheKey, JSON.stringify( otherRepoFilters ) );
			localStorage.setItem( repoCackeExpiryKey, ( Date.now() - 1 ).toString() );

			const repoFilters = await apiClient.loadAvailableRepoFilters();

			expect( repoFilters ).toEqual( fakeRepoFilters );

			// Make sure the cache was also updated
			expect( localStorage.getItem( repoCacheKey ) ).toEqual( JSON.stringify( fakeRepoFilters ) );
			expect( Number( localStorage.getItem( repoCackeExpiryKey ) ) ).toBeGreaterThanOrEqual(
				Date.now()
			);
		} );

		test( 'Throws an error if the request fails', async () => {
			const apiClient = createProductionApiClient();

			const errorBody = {
				error: 'Something went wrong',
			};

			server.get( '/repos', () => {
				return new Response( 500, {}, errorBody );
			} );

			await expect( apiClient.loadAvailableRepoFilters() ).rejects.toThrowError(
				`Get Repo Filters web request failed with status code 500. Response body: ${ JSON.stringify(
					errorBody
				) }`
			);
		} );
	} );
} );
