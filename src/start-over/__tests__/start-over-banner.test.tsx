import React from 'react';
import { AvailableRepoFiltersApiResponse, ReportingConfigApiResponse } from '../../api/types';
import { App } from '../../app/app';
import { RootState } from '../../app/store';
import { normalizeReportingConfig } from '../../static-data/reporting-config/reporting-config-parsers';
import { createFakeRootState } from '../../test-utils/fake-root-state';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { waitForElementToBeRemoved, screen } from '@testing-library/react';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';
import userEvent from '@testing-library/user-event';
import history from 'history/browser';
import { stateToQuery } from '../../url-history/parsers';

describe( '[StartOverBanner]', () => {
	// The best way to test the nuances of this banner is within the context of the whole app.
	// These test will focus more on the behavior that the banner causes, less the behavior that determines whether it shows.
	// That is controlled by the reporting page, so will be tested in the reporting page tests.
	// We still have to create the right pre-conditions for it to show though!

	const taskName = 'Fake Task Title';
	const featureName = 'Unique Feature Name';
	const fakeReportingConfigApiResponse: ReportingConfigApiResponse = {
		'Fake Product': {
			features: {
				[ featureName ]: {
					tasks: {
						bug: [
							{
								title: taskName,
							},
						],
						featureRequest: [],
						urgent: [],
					},
				},
			},
		},
	};

	const fakeAvailableRepos: AvailableRepoFiltersApiResponse = [ 'fakeOrg/fakeRepo' ];

	const normalizedReference = normalizeReportingConfig( fakeReportingConfigApiResponse );
	const expectedFeatureId = Object.keys( normalizedReference.features )[ 0 ];
	const expectedTaskId = Object.keys( normalizedReference.tasks )[ 0 ];

	// This starting state should make the banner appear.
	const startingState: RootState = {
		...createFakeRootState(),
		activePage: 'report-issue',
		activeReportingStep: 'next-steps',
		issueDetails: {
			issueType: 'bug',
			featureId: expectedFeatureId,
			issueTitle: '',
		},
		completedTasks: [ expectedTaskId ],
		// We add these details so that we can make sure they are cleared on starting over!
		duplicateSearch: {
			searchTerm: 'foo bar',
			statusFilter: 'closed',
			activeRepoFilters: [ fakeAvailableRepos[ 0 ] ],
			sort: 'date-created',
		},
	};

	async function setup() {
		const startingStateInUrl = stateToQuery( startingState );
		history.replace( `?${ startingStateInUrl }` );

		const apiClient = createMockApiClient();
		const monitoringClient = createMockMonitoringClient();
		const user = userEvent.setup();

		apiClient.loadReportingConfig = jest.fn().mockResolvedValue( fakeReportingConfigApiResponse );
		apiClient.loadAvailableRepoFilters = jest.fn().mockResolvedValue( fakeAvailableRepos );
		const view = renderWithProviders( <App />, {
			apiClient,
			monitoringClient,
		} );

		await waitForElementToBeRemoved(
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);

		return {
			user,
			apiClient,
			monitoringClient,
			...view,
		};
	}

	test( 'Clicking the Start Over button launches the dropdown menu', async () => {
		const { user } = await setup();

		await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
		expect( screen.getByRole( 'menu', { name: 'Start Over' } ) ).toBeInTheDocument();
	} );

	test( 'Clicking the "Report a new issue" option resets everything and stays on the reporting flow page', async () => {
		const { user } = await setup();

		await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Report a new issue' } ) );

		// We're on the reporting flow
		expect( screen.getByRole( 'heading', { name: 'Report a new issue' } ) ).toBeInTheDocument();

		// First step expanded
		expect( screen.getByRole( 'form', { name: 'Set issue type' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'form', { name: 'Select a feature' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'list', { name: 'Steps to report issue' } )
		).not.toBeInTheDocument();

		// Issue details are cleared out:
		// No issue radio selected in the first step
		expect( screen.queryByRole( 'radio', { checked: true } ) ).not.toBeInTheDocument();
		// No selected feature name anywhere
		expect( screen.queryByText( featureName ) ).not.toBeInTheDocument();
	} );

	test( 'Clicking the "Search for duplicates" option resets everything and goes to the search page', async () => {
		const { user } = await setup();

		await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Search for duplicates' } ) );

		// We're on the duplicate search page
		expect(
			screen.getByRole( 'heading', { name: 'Search for duplicate issues' } )
		).toBeInTheDocument();

		// No search term
		expect(
			screen.queryByRole( 'textbox', { name: 'Search for duplicate issues' } )
		).not.toHaveValue();

		// All filters and sorts are back to defaults
		expect( screen.getByRole( 'option', { name: 'All', selected: true } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Repository filter' } ) ).toHaveAttribute(
			'data-active',
			'false'
		);
		expect( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) ).toHaveTextContent(
			'Relevance'
		);

		// There are no results, just the placeholder
		expect(
			screen.getByRole( 'heading', { name: 'Enter some keywords to search for duplicates.' } )
		).toBeInTheDocument();
	} );

	describe( '[Analytics]', () => {
		test( 'Clicking the "Search for duplicates" option records event', async () => {
			const { user, monitoringClient } = await setup();

			await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Search for duplicates' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'start_over_click', {
				targetActivePage: 'duplicate-search',
			} );
		} );

		test( 'Clicking the "Report a new issue" option records event', async () => {
			const { user, monitoringClient } = await setup();

			await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Report a new issue' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'start_over_click', {
				targetActivePage: 'report-issue',
			} );
		} );
	} );
} );
