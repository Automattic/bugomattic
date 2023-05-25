import React, { ReactElement } from 'react';
import { act, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { App } from '../app';
import { ApiClient, ReportingConfigApiResponse } from '../../api/types';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';
import history from 'history/browser';

describe( '[app]', () => {
	function setup( component: ReactElement, apiClient: ApiClient ) {
		const monitoringClient = createMockMonitoringClient();
		renderWithProviders( component, {
			apiClient,
			monitoringClient,
		} );

		return { monitoringClient };
	}

	test( 'App shows loading indicator until all configuration is loaded, then the current landing page (duplicate searching)', async () => {
		const apiClient = createMockApiClient();
		// This function will get set to the resolve() function in the API client call.
		let resolveReportingConfigRequestPromise: (
			config: ReportingConfigApiResponse
		) => void = () => {
			throw new Error( 'loadReportingConfig was not called in mocked API Client' );
		};
		const reportingConfigRequestPromise = new Promise< ReportingConfigApiResponse >(
			( resolve ) => {
				resolveReportingConfigRequestPromise = resolve;
			}
		);
		apiClient.loadReportingConfig.mockReturnValue( reportingConfigRequestPromise );

		let resolveAvailableRepoFiltersRequestPromise: ( config: string[] ) => void = () => {
			throw new Error( 'loadAvailableRepoFilters was not called in mocked API Client' );
		};
		const availableRepoFiltersRequestPromise = new Promise< string[] >( ( resolve ) => {
			resolveAvailableRepoFiltersRequestPromise = resolve;
		} );
		apiClient.loadAvailableRepoFilters.mockReturnValue( availableRepoFiltersRequestPromise );

		setup( <App />, apiClient );

		// Loading indicator is present...
		expect(
			screen.getByRole( 'alert', { name: 'Loading required app data' } )
		).toBeInTheDocument();
		// ...Landing page is not.
		expect(
			screen.queryByRole( 'heading', { name: 'Search for duplicate issues' } )
		).not.toBeInTheDocument();

		resolveReportingConfigRequestPromise( {} );

		// We're still not ready! We've resolved one request, but more remain!

		resolveAvailableRepoFiltersRequestPromise( [] );

		// Now we should be ready!

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);

		expect(
			await screen.findByRole( 'heading', { name: 'Search for duplicate issues' } )
		).toBeInTheDocument();
	} );

	test( 'Even if web requests fail, we still show the app', async () => {
		const apiClient = createMockApiClient();
		const apiErrorMessage = 'Request failed with status code 500';
		const apiError = new Error( apiErrorMessage );
		apiClient.loadReportingConfig.mockRejectedValue( apiError );
		apiClient.loadAvailableRepoFilters.mockRejectedValue( apiError );

		setup( <App />, apiClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);

		expect(
			await screen.findByRole( 'heading', { name: 'Search for duplicate issues' } )
		).toBeInTheDocument();
	} );

	test( 'On loading, records the "page_view" with empty query string', async () => {
		const apiClient = createMockApiClient();

		const { monitoringClient } = setup( <App />, apiClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);
		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'page_view', {
			query: '',
		} );
	} );

	test( 'On loading from URL history, records the "page_view" with query string', async () => {
		const apiClient = createMockApiClient();
		const query = '?activePage=report-issue';

		act( () => {
			history.replace( query );
		} );

		const { monitoringClient } = setup( <App />, apiClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);
		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'page_view', {
			query: query,
		} );
	} );

	// This main seem silly, but this is an important test!
	// We set focus on page headers on page navigation, and have to make sure we don't do that on initial load.
	// This test verifies that! The page heading focus is tested elsewhere.
	test( 'On app boot, focus is on the body element', async () => {
		const apiClient = createMockApiClient();

		setup( <App />, apiClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);

		expect( document.body ).toHaveFocus();
	} );
} );
