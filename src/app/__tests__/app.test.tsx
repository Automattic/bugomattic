import React, { ReactElement } from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { App } from '../app';
import { ApiClient, ReportingConfigApiResponse } from '../../api/types';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';
import { MonitoringClient } from '../../monitoring/types';

describe( '[app]', () => {
	function setup(
		component: ReactElement,
		apiClient: ApiClient,
		monitoringClient?: MonitoringClient
	) {
		renderWithProviders( component, {
			apiClient,
			monitoringClient,
		} );
	}

	test( 'App shows loading indicator until reporting config is loaded, then the reporting flow', async () => {
		const apiClient = createMockApiClient();
		// This function will get set to the resolve() function in the API client call.
		let resolveRequestPromise: ( config: ReportingConfigApiResponse ) => void = () => {
			throw new Error( 'loadReportingConfig was not called in mocked API Client' );
		};
		const requestPromise = new Promise< ReportingConfigApiResponse >( ( resolve ) => {
			resolveRequestPromise = resolve;
		} );
		apiClient.loadReportingConfig.mockReturnValue( requestPromise );

		setup( <App />, apiClient );

		// Loading indicator is present...
		expect(
			screen.getByRole( 'alert', { name: 'Loading issue reporting configuration' } )
		).toBeInTheDocument();
		// ...Reporting flow is not.
		expect(
			screen.queryByRole( 'heading', { name: 'Report a new issue' } )
		).not.toBeInTheDocument();

		resolveRequestPromise( {} );

		// Then it flips!

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading issue reporting configuration' } )
		);

		expect(
			await screen.findByRole( 'heading', { name: 'Report a new issue' } )
		).toBeInTheDocument();
	} );

	test( 'If the web request to load the reporting config fails, shows app error component and logs error', async () => {
		const apiClient = createMockApiClient();
		const monitoringClient = createMockMonitoringClient();
		const apiErrorMessage = 'Request failed with status code 500';
		const apiError = new Error( apiErrorMessage );
		apiClient.loadReportingConfig.mockRejectedValue( apiError );

		setup( <App />, apiClient, monitoringClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading issue reporting configuration' } )
		);

		expect(
			screen.getByRole( 'alert', { name: 'Uh oh! Something went wrong :(' } )
		).toBeInTheDocument();

		expect( monitoringClient.logger.error ).toBeCalledWith(
			'Error occurred when loading the reporting config',
			{ error: `${ apiError.name }: ${ apiError.message }` }
		);
	} );

	test( 'If parsing the reporting config fails, shows app error component and logs error', async () => {
		const apiClient = createMockApiClient();
		const monitoringClient = createMockMonitoringClient();
		const reportingConfigToCauseError = { foo: 'bar' };
		apiClient.loadReportingConfig.mockResolvedValue( reportingConfigToCauseError );

		setup( <App />, apiClient, monitoringClient );

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'alert', { name: 'Loading issue reporting configuration' } )
		);

		expect(
			screen.getByRole( 'alert', { name: 'Uh oh! Something went wrong :(' } )
		).toBeInTheDocument();

		expect( monitoringClient.logger.error ).toBeCalledWith(
			'Error occurred when loading the reporting config',
			{
				error: expect.stringContaining( 'Failed to normalize reporting config' ),
			}
		);
	} );
} );
