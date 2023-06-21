import React from 'react';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { AvailableRepoFiltersState } from '../../static-data/available-repo-filters/types';
import { act, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { IssueSearchingPage } from '../issue-searching-page';
import { SearchIssueApiResponse } from '../../api/types';
import { Issue } from '../../issue-search-results/types';
import { PageNavigationProvider } from '../../active-page/page-navigation-provider';
import { App } from '../../app/app';
import { RootState } from '../../app/store';
import history from 'history/browser';
import { stateToQuery } from '../../url-history/parsers';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';
import { IssueSearchState } from '../../issue-search/types';

describe( '[IssueSearchingPage]', () => {
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
		await user.click( screen.getByRole( 'textbox', { name: 'Search for existing issues' } ) );
		await user.keyboard( searchTerm );
		// Bypass debouncing by hitting enter
		await user.keyboard( '{Enter}' );
	}

	describe( 'Search results lifecycle', () => {
		function setup() {
			const apiClient = createMockApiClient();
			const monitoringClient = createMockMonitoringClient();
			const user = userEvent.setup();
			const view = renderWithProviders(
				<PageNavigationProvider>
					<IssueSearchingPage />
				</PageNavigationProvider>,
				{
					apiClient,
					monitoringClient,
					preloadedState: {
						availableRepoFilters: availableRepoFiltersState,
					},
				}
			);

			return {
				user,
				apiClient,
				monitoringClient,
				...view,
			};
		}

		test( 'Initially, shows the search results placeholder', () => {
			setup();

			expect(
				screen.getByRole( 'heading', {
					name: 'Enter some keywords to search for existing issues.',
				} )
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
				screen.getByRole( 'alert', { name: 'Issue search in progress' } )
			).toBeInTheDocument();

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			resolveSearchIssuesPromise!( [ fakeIssue ] );

			await waitForElementToBeRemoved( () =>
				screen.queryByRole( 'alert', { name: 'Issue search in progress' } )
			);

			expect( screen.getByRole( 'list', { name: 'Issue search results' } ) ).toBeInTheDocument();
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

			await user.clear( screen.getByRole( 'textbox', { name: 'Search for existing issues' } ) );
			await user.keyboard( '{Enter}' );

			expect(
				screen.getByRole( 'heading', {
					name: 'Enter some keywords to search for existing issues.',
				} )
			).toBeInTheDocument();

			expect( apiClient.searchIssues ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'If the request throws an error, shows error message and logs one error, even if error recurs', async () => {
			const { apiClient, monitoringClient, user } = setup();
			const errorMessage = 'Request error message';
			apiClient.searchIssues.mockRejectedValue( new Error( errorMessage ) );

			await search( user, 'foo' );

			expect(
				await screen.findByRole( 'heading', { name: 'Uh oh! Something went wrong.' } )
			).toBeInTheDocument();

			expect( monitoringClient.logger.error ).toHaveBeenCalledWith(
				'Error in issue search request',
				{
					errorMessage: `Error: ${ errorMessage }`,
				}
			);

			await search( user, 'bar' );
			expect(
				await screen.findByRole( 'heading', { name: 'Uh oh! Something went wrong.' } )
			).toBeInTheDocument();

			expect( monitoringClient.logger.error ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Report an issue banner', () => {
		// Since this banner involves navigation to another page, it makes sense to render the whole app.
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
			apiClient.loadAvailableRepoFilters.mockResolvedValue( availableRepoFilters );

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

		test( 'Selecting an issue type records event', async () => {
			const { apiClient, monitoringClient, user } = await setup();
			apiClient.searchIssues.mockResolvedValue( [] );
			await search( user, 'foo bar' );

			// Wait for it to show up.
			await screen.findByRole( 'region', { name: 'Report a new issue' } );

			await user.click( screen.getByRole( 'button', { name: 'Report an Issue' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Escalate something urgent' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith(
				'banner_report_issue_start',
				{ issueType: 'urgent' }
			);
		} );
	} );

	describe( 'Searching from URL history', () => {
		// We're working with loading the app and other history updates -- let's render the whole app.
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
			apiClient.loadAvailableRepoFilters.mockResolvedValue( availableRepoFilters );
			apiClient.searchIssues.mockResolvedValue( [] );

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

		test( 'When the app loads, if there is a non-empty search term, we fire a search', async () => {
			const startingState: Partial< RootState > = {
				issueSearch: {
					searchTerm: 'foo',
					sort: 'relevance',
					statusFilter: 'all',
					activeRepoFilters: [],
				},
			};

			const { apiClient } = await setup( startingState );

			expect( apiClient.searchIssues ).toHaveBeenCalledTimes( 1 );
			expect( apiClient.searchIssues ).toHaveBeenCalledWith(
				startingState.issueSearch?.searchTerm,
				{
					sort: startingState.issueSearch?.sort,
					status: startingState.issueSearch?.statusFilter,
					repos: startingState.issueSearch?.activeRepoFilters,
				}
			);
		} );

		test( 'When the app loads, if the search term is empty, we do not search', async () => {
			const startingState: Partial< RootState > = {
				issueSearch: {
					searchTerm: '',
					sort: 'date-created',
					statusFilter: 'open',
					activeRepoFilters: availableRepoFilters,
				},
			};

			const { apiClient } = await setup( startingState );

			expect( apiClient.searchIssues ).not.toHaveBeenCalled();
		} );

		test( 'Searches only fire when history changes affect the search parameters', async () => {
			const startingSearchState: IssueSearchState = {
				searchTerm: 'foo',
				sort: 'relevance',
				statusFilter: 'all',
				activeRepoFilters: [],
			};
			const startingState: Partial< RootState > = {
				issueSearch: startingSearchState,
			};

			const { apiClient } = await setup( startingState );
			apiClient.searchIssues.mockClear();

			// Popping the history doesn't work in the jest-dom environment, but replacing it does.
			// So we'll test by replacement! Not ideal, but runs the same code paths, so is a good proxy.

			const newStateWithNoSearchChanges: Partial< RootState > = {
				issueSearch: startingSearchState,
				issueDetails: {
					issueTitle: '',
					featureId: null,
					issueType: 'urgent',
				},
			};

			act( () => {
				history.replace( `?${ stateToQuery( newStateWithNoSearchChanges as RootState ) }` );
			} );

			expect( apiClient.searchIssues ).not.toHaveBeenCalled();

			const newSearchState: IssueSearchState = {
				...startingSearchState,
				searchTerm: 'bar',
			};
			const newStateWithSearchChanges: Partial< RootState > = {
				issueSearch: newSearchState,
			};

			act( () => {
				history.replace( `?${ stateToQuery( newStateWithSearchChanges as RootState ) }` );
			} );
			// Prevent act warnings by waiting for the empty results to be re-rendered.
			await screen.findByRole( 'heading', { name: 'No results found.' } );

			expect( apiClient.searchIssues ).toHaveBeenCalledTimes( 1 );
			expect( apiClient.searchIssues ).toHaveBeenCalledWith( newSearchState.searchTerm, {
				sort: newSearchState.sort,
				status: newSearchState.statusFilter,
				repos: newSearchState.activeRepoFilters,
			} );
		} );
	} );
} );
