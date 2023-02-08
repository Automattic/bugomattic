import React from 'react';
import { ReactElement } from 'react';
import { MonitoringClient } from '../../monitoring/types';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { AppErrorBoundary } from '../app-error-boundary';
import { screen } from '@testing-library/react';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

describe( '[AppErrorBoundary]', () => {
	function setup( component: ReactElement, monitoringClient?: MonitoringClient ) {
		renderWithProviders( component, {
			apiClient: createMockApiClient(),
			monitoringClient,
		} );
	}

	// JSDOM and React always dump errors to the console, even if handled!
	// So we need to minimize the noise in the test output.
	// See https://github.com/facebook/react/issues/11098

	let spy: jest.SpyInstance;
	beforeEach( () => {
		spy = jest.spyOn( console, 'error' );
		spy.mockImplementation( () => {
			return;
		} );
	} );

	afterEach( () => {
		spy.mockRestore();
	} );

	test( 'Shows the child components if no error occurs', () => {
		const FakeComponent = () => <button>Foo</button>;

		setup(
			<AppErrorBoundary>
				<FakeComponent />
			</AppErrorBoundary>
		);

		expect( screen.getByRole( 'button', { name: 'Foo' } ) ).toBeInTheDocument();
	} );

	test( 'Shows the app error display if an error occurs, and no other child content', () => {
		const error = new Error( 'Fake error' );
		const ErroredComponent = () => {
			throw error;
		};

		const ComponentThatWontDisplay = () => <button>Foo</button>;

		const monitoringClient = createMockMonitoringClient();

		setup(
			<AppErrorBoundary>
				<>
					<ErroredComponent />
					<ComponentThatWontDisplay />
				</>
			</AppErrorBoundary>,
			monitoringClient
		);

		expect( screen.queryByRole( 'button', { name: 'Foo' } ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'alert', { name: 'Uh oh! Something went wrong :(' } )
		).toBeInTheDocument();
	} );

	test( 'Logs an error if an error occurs ', () => {
		const error = new Error( 'Fake error' );
		const ErroredComponent = () => {
			throw error;
		};

		const monitoringClient = createMockMonitoringClient();

		setup(
			<AppErrorBoundary>
				<ErroredComponent />
			</AppErrorBoundary>,
			monitoringClient
		);

		expect( monitoringClient.logger.error ).toHaveBeenCalledWith( 'Unexpected app error occurred', {
			error: error,
			componentStack: expect.stringContaining( 'at ErrorBoundary' ),
		} );
	} );
} );
