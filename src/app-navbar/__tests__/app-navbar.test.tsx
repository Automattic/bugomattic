import React from 'react';
import { RootState } from '../../app/store';
import history from 'history/browser';
import { stateToQuery } from '../../url-history/parsers';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { waitForElementToBeRemoved, screen, waitFor } from '@testing-library/react';
import { App } from '../../app/app';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

describe( '[AppNavbar]', () => {
	async function setup( preloadedState?: Partial< RootState > ) {
		// Clear old history
		history.replace( '' );
		if ( preloadedState ) {
			// Set the new one if needed
			const preloadedStateInUrl = stateToQuery( preloadedState as RootState );
			history.replace( `?${ preloadedStateInUrl }` );
		}

		const monitoringClient = createMockMonitoringClient();
		const apiClient = createMockApiClient();
		apiClient.loadReportingConfig.mockResolvedValue( {} );
		apiClient.loadAvailableRepoFilters.mockResolvedValue( [ 'foo/bar' ] );

		const user = userEvent.setup();
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

	test( 'The currently active page is marked as aria-current="page"', async () => {
		await setup( { activePage: 'report-issue' } );

		expect( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) ).toHaveAttribute(
			'aria-current',
			'page'
		);

		expect( screen.getByRole( 'menuitem', { name: 'Search for Issues' } ) ).not.toHaveAttribute(
			'aria-current',
			'page'
		);
	} );

	test( 'With no isue type set, the "Report an Issue" is a dropdown that sets issue type and navigates to the reporting flow', async () => {
		const { user } = await setup();

		await user.click( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Escalate something urgent' } ) );

		expect(
			await screen.findByRole( 'heading', { name: 'Report a new issue' } )
		).toBeInTheDocument();
		expect( screen.getByText( "It's Urgent!" ) ).toBeInTheDocument();
		expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
	} );

	test( 'With an issue type set, the "Report an Issue" is a simple (no dropdown) button that navigates to the reporting flow', async () => {
		const { user } = await setup( {
			issueDetails: { issueType: 'bug', issueTitle: '', featureId: null },
		} );

		await user.click( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) );

		expect(
			await screen.findByRole( 'heading', { name: 'Report a new issue' } )
		).toBeInTheDocument();
	} );

	test( 'On navigation, focus is placed on the next page heading', async () => {
		const { user } = await setup();

		await user.click( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) );
		await user.click( screen.getByRole( 'menuitem', { name: 'Escalate something urgent' } ) );

		const reportingFlowPageHeading = screen.getByRole( 'heading', {
			name: 'Report a new issue',
		} );
		expect( reportingFlowPageHeading ).toBeInTheDocument();
		expect( reportingFlowPageHeading ).toHaveFocus();

		await user.click( screen.getByRole( 'menuitem', { name: 'Search for Issues' } ) );
		const issueSearchingPageHeading = screen.getByRole( 'heading', {
			name: 'Search for existing issues',
		} );
		expect( issueSearchingPageHeading ).toBeInTheDocument();
		expect( issueSearchingPageHeading ).toHaveFocus();
	} );

	test( 'The menubar supports keyboard navigation', async () => {
		const { user } = await setup();

		const reportAnIssueButton = screen.getByRole( 'menuitem', { name: 'Report an Issue' } );
		const issueSearchButton = screen.getByRole( 'menuitem', { name: 'Search for Issues' } );

		// Focus site header link
		screen.getByRole( 'link', { name: 'Bugomattic' } ).focus();

		// Tab into navbar
		await user.keyboard( '{tab}' );

		// Default page starts with focus -- search for issues
		expect( issueSearchButton ).toHaveFocus();

		// Basic menubar nav
		await user.keyboard( '{arrowright}' );
		expect( reportAnIssueButton ).toHaveFocus();

		await user.keyboard( '{arrowleft}' );
		expect( issueSearchButton ).toHaveFocus();

		await user.keyboard( '{end}' );
		expect( reportAnIssueButton ).toHaveFocus();

		await user.keyboard( '{home}' );
		expect( issueSearchButton ).toHaveFocus();

		// Opening the dropdown
		await user.keyboard( '{arrowright}' );
		await user.keyboard( '{arrowdown}' );
		// Wait for dropdown to open
		expect( await screen.findByRole( 'menu', { name: 'Report an Issue' } ) ).toBeInTheDocument();
		// First option is focused -- can take a bit, so using waitFor
		await waitFor( () =>
			expect( screen.getByRole( 'menuitem', { name: 'Report a bug' } ) ).toHaveFocus()
		);
	} );

	describe( '[Analytics]', () => {
		test( 'Selecting an issue type in the navbar records event', async () => {
			const { user, monitoringClient } = await setup();

			await user.click( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Report a bug' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith(
				'navbar_report_issue_start',
				{
					issueType: 'bug',
				}
			);
		} );

		test( 'Selecting the "Report an Issue" in the navbar records event', async () => {
			const { monitoringClient, user } = await setup( {
				issueDetails: { issueType: 'bug', issueTitle: '', featureId: null },
			} );

			await user.click( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'navbar_item_click', {
				page: 'report-issue',
			} );
		} );

		test( 'Selecting the "Report an Issue" in the navbar records event', async () => {
			const { monitoringClient, user } = await setup();

			await user.click( screen.getByRole( 'menuitem', { name: 'Search for Issues' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'navbar_item_click', {
				page: 'search-issues',
			} );
		} );
	} );
} );
