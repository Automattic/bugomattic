import React, { ReactElement } from 'react';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { DuplicateSearchControls } from '../duplicate-search-controls';
import { screen } from '@testing-library/react';
import { DuplicateSearchState } from '../types';

describe( '[DuplicateSearchControls]', () => {
	const startingSearchState: DuplicateSearchState = {
		searchTerm: 'foo bar',
		statusFilter: 'all',
		activeRepoFilters: [],
		sort: 'relevance',
	};

	function setup( component: ReactElement ) {
		const apiClient = createMockApiClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, {
			apiClient,
			preloadedState: {
				duplicateSearch: startingSearchState,
			},
		} );

		return {
			user,
			apiClient,
			...view,
		};
	}

	describe( 'Status filter', () => {
		test( 'By default the "All" filter is selected', () => {
			setup( <DuplicateSearchControls /> );

			expect( screen.getByRole( 'option', { name: 'All', selected: true } ) ).toBeInTheDocument();
		} );

		test( 'Selecting a new status filter marks that status as selected', async () => {
			setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'option', { name: 'Open' } ) );

			expect( screen.getByRole( 'option', { name: 'Open', selected: true } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'All', selected: false } ) ).toBeInTheDocument();
		} );

		test( 'Selecting a new filter triggers a new search with the selected status filter', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'option', { name: 'Closed' } ) );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith( startingSearchState.searchTerm, {
				status: 'closed',
				sort: startingSearchState.sort,
				repos: startingSearchState.activeRepoFilters,
			} );
		} );

		test( 'Selecting the same filter does not trigger a new search', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'option', { name: 'All' } ) );

			expect( apiClient.searchIssues ).not.toHaveBeenCalled();
		} );
	} );
} );
