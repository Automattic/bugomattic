import React, { ReactElement } from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { App } from '../app';
import { ApiClient, ReportingConfigApiResponse } from '../../api/types';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';

describe( '[app]', () => {
	function setup( component: ReactElement, apiClient: ApiClient ) {
		renderWithProviders( component, {
			apiClient,
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
			screen.getByRole( 'dialog', { name: 'Loading issue reporting configuration...' } )
		).toBeInTheDocument();
		// ...Reporting flow is not.
		expect(
			screen.queryByRole( 'heading', { name: 'Report a new issue' } )
		).not.toBeInTheDocument();

		resolveRequestPromise( {} );

		// Then it flips!

		await waitForElementToBeRemoved( () =>
			screen.queryByRole( 'dialog', { name: 'Loading issue reporting configuration...' } )
		);

		expect(
			await screen.findByRole( 'heading', { name: 'Report a new issue' } )
		).toBeInTheDocument();
	} );
} );
