import React from 'react';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { AvailableRepoFiltersState } from '../../static-data/available-repo-filters/types';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { DuplicateSearchingPage } from '../duplicate-searching-page';
import { SearchIssueApiResponse } from '../../api/types';
import { Issue } from '../../duplicate-results/types';
import { PageNavigationProvider } from '../../active-page/page-navigation-provider';
import { App } from '../../app/app';
import { RootState } from '../../app/store';
import history from 'history/browser';
import { stateToQuery } from '../../url-history/parsers';

describe( '[DuplicateSearchingPage]', () => {
	const fakeIssue: Issue = {
		title: 'Test Issue Title',
		url: 'https://github.com/test/test/issues/1',
		content: 'Fake issue content.',
		status: 'open',
		dateCreated: new Date().toISOString(),
		dateUpdated: new Date().toISOString(),
		author: 'Fake Testing User',
		repo: 'Testorg/Testrepo',
	};

	const availableRepoFilters = [ 'fakeOrg/fakeRepo', 'otherOrg/otherRepo' ];
	const availableRepoFiltersState: AvailableRepoFiltersState = {
		repos: availableRepoFilters,
		loadError: null,
	};

	async function search( user: ReturnType< typeof userEvent.setup >, searchTerm: string ) {
		await user.click( screen.getByRole( 'textbox', { name: 'Search for duplicate issues' } ) );
		await user.keyboard( searchTerm );
		// Bypass debouncing by hitting enter
		await user.keyboard( '{Enter}' );
	}

	describe( 'Search results lifecycle', () => {
		function setup() {
			const apiClient = createMockApiClient();
			const user = userEvent.setup();
			const view = renderWithProviders(
				<PageNavigationProvider>
					<DuplicateSearchingPage />
				</PageNavigationProvider>,
				{
					apiClient,
					preloadedState: {
						availableRepoFilters: availableRepoFiltersState,
					},
				}
			);

			return {
				user,
				apiClient,
				...view,
			};
		}

		test( 'Initially, shows the search results placeholder', () => {
			setup();

			expect(
				screen.getByRole( 'heading', { name: 'Enter some keywords to search for duplicates.' } )
			).toBeInTheDocument();
		} );

		test( 'When searching, shows loading indicator, then results when search is done', async () => {
			const { apiClient, user } = setup();

			let resolveSearchIssuesPromise: ( results: SearchIssueApiResponse ) => void;
			const searchIssuesPromise = new Promise< SearchIssueApiResponse >( ( resolve ) => {
				resolveSearchIssuesPromise = resolve;
			} );
			apiClient.searchIssues.mockReturnValue( searchIssuesPromise );

			await search( user, 'foo' );

			expect(
				screen.getByRole( 'alert', { name: 'Duplicate search in progress' } )
			).toBeInTheDocument();

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			resolveSearchIssuesPromise!( [ fakeIssue ] );

			await waitForElementToBeRemoved( () =>
				screen.queryByRole( 'alert', { name: 'Duplicate search in progress' } )
			);

			expect(
				screen.getByRole( 'list', { name: 'Duplicate issue search results' } )
			).toBeInTheDocument();
		} );

		test( 'If no search results are found, shows message about no results', async () => {
			const { apiClient, user } = setup();

			apiClient.searchIssues.mockResolvedValue( [] );

			await search( user, 'foo' );
			expect(
				await screen.findByRole( 'heading', { name: 'No results found.' } )
			).toBeInTheDocument();
		} );

		test( "If user clears their search and presses enter, shows the search results placeholder but still doesn't fire a search", async () => {
			const { apiClient, user } = setup();
			apiClient.searchIssues.mockResolvedValue( [ fakeIssue ] );

			await search( user, 'foo' );

			await user.clear( screen.getByRole( 'textbox', { name: 'Search for duplicate issues' } ) );
			await user.keyboard( '{Enter}' );

			expect(
				screen.getByRole( 'heading', { name: 'Enter some keywords to search for duplicates.' } )
			).toBeInTheDocument();

			expect( apiClient.searchIssues ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Report an issue banner', () => {
		// Since this banner involves navigation to another page, it makes sense to render the whole app.
		async function setup( preloadedState?: Partial< RootState > ) {
			if ( preloadedState ) {
				const preloadedStateInUrl = stateToQuery( preloadedState as RootState );
				history.replace( `?${ preloadedStateInUrl }` );
			}

			const apiClient = createMockApiClient();
			apiClient.loadReportingConfig.mockResolvedValue( {} );
			apiClient.loadAvailableRepoFilters.mockResolvedValue( availableRepoFilters );

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

		test( 'The banner does not appear until after search results load', async () => {
			const { apiClient, user } = await setup();

			expect(
				screen.queryByRole( 'region', { name: 'Report a new issue' } )
			).not.toBeInTheDocument();

			let resolveSearchIssuesPromise: ( results: SearchIssueApiResponse ) => void;
			const searchIssuesPromise = new Promise< SearchIssueApiResponse >( ( resolve ) => {
				resolveSearchIssuesPromise = resolve;
			} );
			apiClient.searchIssues.mockReturnValue( searchIssuesPromise );

			await search( user, 'foo bar' );

			// Still not there! We're mid-search.
			expect(
				screen.queryByRole( 'region', { name: 'Report a new issue' } )
			).not.toBeInTheDocument();

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			resolveSearchIssuesPromise!( [ fakeIssue ] );

			expect(
				await screen.findByRole( 'region', { name: 'Report a new issue' } )
			).toBeInTheDocument();
		} );

		test( 'Selecting an issue type from the dropdown navigates to the reporting flow, sets issue type, and focuses page heading', async () => {
			const { apiClient, user } = await setup();
			apiClient.searchIssues.mockResolvedValue( [] );
			await search( user, 'foo bar' );

			// Wait for it to show up.
			await screen.findByRole( 'region', { name: 'Report a new issue' } );

			await user.click( screen.getByRole( 'button', { name: 'Report an Issue' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Escalate something urgent' } ) );

			const reportingFlowPageHeading = screen.getByRole( 'heading', {
				name: 'Report a new issue',
			} );
			expect( reportingFlowPageHeading ).toBeInTheDocument();
			expect( screen.getByText( "It's Urgent!" ) ).toBeInTheDocument();
			expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();

			expect( reportingFlowPageHeading ).toHaveFocus();
		} );

		test( 'If there is already an issue type, there is just a simple button that takes to the reporting flow', async () => {
			const { apiClient, user } = await setup( {
				issueDetails: {
					issueType: 'urgent',
					featureId: null,
					issueTitle: '',
				},
			} );

			apiClient.searchIssues.mockResolvedValue( [] );
			await search( user, 'foo bar' );

			// Wait for it to show up.
			await screen.findByRole( 'region', { name: 'Report a new issue' } );

			await user.click( screen.getByRole( 'button', { name: 'Report an Issue' } ) );

			expect( screen.getByRole( 'heading', { name: 'Report a new issue' } ) ).toBeInTheDocument();
		} );
	} );
} );
