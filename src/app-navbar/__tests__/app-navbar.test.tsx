import React from 'react';
import { RootState } from '../../app/store';
import history from 'history/browser';
import { stateToQuery } from '../../url-history/parsers';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { waitForElementToBeRemoved, screen, waitFor } from '@testing-library/react';
import { App } from '../../app/app';

describe( '[AppNavbar]', () => {
	async function setup( preloadedState?: Partial< RootState > ) {
		// Clear old history
		history.replace( '' );
		if ( preloadedState ) {
			// Set the new one if needed
			const preloadedStateInUrl = stateToQuery( preloadedState as RootState );
			history.replace( `?${ preloadedStateInUrl }` );
		}

		const apiClient = createMockApiClient();
		apiClient.loadReportingConfig.mockResolvedValue( {} );
		apiClient.loadAvailableRepoFilters.mockResolvedValue( [ 'foo/bar' ] );

		const user = userEvent.setup();
		const view = renderWithProviders( <App />, {
			apiClient,
		} );

		await waitForElementToBeRemoved(
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);

		return {
			user,
			apiClient,
			...view,
		};
	}

	test( 'The currently active page is marked as aria-current="page"', async () => {
		await setup( { activePage: 'report-issue' } );

		expect( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) ).toHaveAttribute(
			'aria-current',
			'page'
		);

		expect( screen.getByRole( 'menuitem', { name: 'Duplicate Search' } ) ).not.toHaveAttribute(
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

		await user.click( screen.getByRole( 'menuitem', { name: 'Duplicate Search' } ) );
		const duplicateSearchingPageHeading = screen.getByRole( 'heading', {
			name: 'Search for duplicate issues',
		} );
		expect( duplicateSearchingPageHeading ).toBeInTheDocument();
		expect( duplicateSearchingPageHeading ).toHaveFocus();
	} );

	test( 'The menubar supports keyboard navigation', async () => {
		const { user } = await setup();

		const reportAnIssueButton = screen.getByRole( 'menuitem', { name: 'Report an Issue' } );
		const duplicateSearchButton = screen.getByRole( 'menuitem', { name: 'Duplicate Search' } );

		// Focus site header link
		screen.getByRole( 'link', { name: 'Bugomattic' } ).focus();

		// Tab into navbar
		await user.keyboard( '{tab}' );

		// Default page starts with focus -- duplicate search
		expect( duplicateSearchButton ).toHaveFocus();

		// Basic menubar nav
		await user.keyboard( '{arrowright}' );
		expect( reportAnIssueButton ).toHaveFocus();

		await user.keyboard( '{arrowleft}' );
		expect( duplicateSearchButton ).toHaveFocus();

		await user.keyboard( '{end}' );
		expect( reportAnIssueButton ).toHaveFocus();

		await user.keyboard( '{home}' );
		expect( duplicateSearchButton ).toHaveFocus();

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
} );
