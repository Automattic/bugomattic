import React from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { App } from '../app';
import { ApiClient } from '../../api/types';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';

describe( '[app]', () => {
	let apiClient: ApiClient;

	beforeEach( () => {
		apiClient = createMockApiClient();
	} );

	test( 'Loading indicator goes away once reporting config is loaded', async () => {
		renderWithProviders( <App />, { apiClient } );
		await waitForElementToBeRemoved( () => screen.queryByText( 'Reporting config is loading...' ) );
	} );
} );
