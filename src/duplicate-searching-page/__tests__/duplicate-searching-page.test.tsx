import React, { ReactElement } from 'react';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { AvailableRepoFiltersState } from '../../static-data/available-repo-filters/types';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { DuplicateSearchingPage } from '../duplicate-searching-page';
import { SearchIssueApiResponse } from '../../api/types';
import { Issue } from '../../duplicate-results/types';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

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

	function setup( component: ReactElement ) {
		const apiClient = createMockApiClient();
		const monitoringClient = createMockMonitoringClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, {
			apiClient,
			monitoringClient,
			preloadedState: {
				availableRepoFilters: availableRepoFiltersState,
			},
		} );

		return {
			user,
			apiClient,
			monitoringClient,
			...view,
		};
	}

	async function search( user: ReturnType< typeof userEvent.setup >, searchTerm: string ) {
		await user.click( screen.getByRole( 'textbox', { name: 'Search for duplicate issues' } ) );
		await user.keyboard( searchTerm );
		// Bypass debouncing by hitting enter
		await user.keyboard( '{Enter}' );
	}

	describe( 'Search results lifecycle', () => {
		test( 'Initially, shows the search results placeholder', () => {
			setup( <DuplicateSearchingPage /> );

			expect(
				screen.getByRole( 'heading', { name: 'Enter some keywords to search for duplicates.' } )
			).toBeInTheDocument();
		} );

		test( 'When searching, shows loading indicator, then results when search is done', async () => {
			const { apiClient, user } = setup( <DuplicateSearchingPage /> );

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
			const { apiClient, user } = setup( <DuplicateSearchingPage /> );

			apiClient.searchIssues.mockResolvedValue( [] );

			await search( user, 'foo' );
			expect(
				await screen.findByRole( 'heading', { name: 'No results found.' } )
			).toBeInTheDocument();
		} );

		test( "If user clears their search and presses enter, shows the search results placeholder but still doesn't fire a search", async () => {
			const { apiClient, user } = setup( <DuplicateSearchingPage /> );
			apiClient.searchIssues.mockResolvedValue( [ fakeIssue ] );

			await search( user, 'foo' );

			await user.clear( screen.getByRole( 'textbox', { name: 'Search for duplicate issues' } ) );
			await user.keyboard( '{Enter}' );

			expect(
				screen.getByRole( 'heading', { name: 'Enter some keywords to search for duplicates.' } )
			).toBeInTheDocument();

			expect( apiClient.searchIssues ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'If the request throws an error, shows error message and logs one error, even if error recurs', async () => {
			const { apiClient, monitoringClient, user } = setup( <DuplicateSearchingPage /> );
			const errorMessage = 'Request error message';
			apiClient.searchIssues.mockRejectedValue( new Error( errorMessage ) );

			await search( user, 'foo' );

			expect(
				await screen.findByRole( 'heading', { name: 'Uh oh! Something went wrong.' } )
			).toBeInTheDocument();

			expect( monitoringClient.logger.error ).toHaveBeenCalledWith(
				'Error in duplicate search request',
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
} );
