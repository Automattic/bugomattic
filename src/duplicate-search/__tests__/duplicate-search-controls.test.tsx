import React, { ReactElement } from 'react';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { DuplicateSearchControls } from '../duplicate-search-controls';
import { screen } from '@testing-library/react';
import { DuplicateSearchState } from '../types';

// For some list assertions, this is really our best option, so ignoring in this file.
/* eslint-disable testing-library/no-node-access */

// Needed for the repo filter popover
class MockResizeObserver {
	observe = jest.fn();
	unobserve = jest.fn();
	disconnect = jest.fn();
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

describe( '[DuplicateSearchControls]', () => {
	const availableRepoFilters = [ 'xyzOrg/xyzRepo', 'xyzOrg/abcRepo', 'abcOrg/otherRepo' ];
	const defaultInitialSearchState: DuplicateSearchState = {
		searchTerm: 'foo bar',
		statusFilter: 'all',
		activeRepoFilters: [],
		sort: 'relevance',
	};

	function setup( component: ReactElement, initialSearchState?: DuplicateSearchState ) {
		const apiClient = createMockApiClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, {
			apiClient,
			preloadedState: {
				duplicateSearch: initialSearchState ?? defaultInitialSearchState,
				availableRepoFilters: {
					repos: availableRepoFilters,
					loadError: null,
				},
			},
		} );

		return {
			user,
			apiClient,
			...view,
		};
	}

	function getRepoNameFromFullName( fullName: string ) {
		return fullName.split( '/' )[ 1 ];
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

			expect( apiClient.searchIssues ).toHaveBeenCalledWith( defaultInitialSearchState.searchTerm, {
				status: 'closed',
				sort: defaultInitialSearchState.sort,
				repos: defaultInitialSearchState.activeRepoFilters,
			} );
		} );

		test( 'Selecting the same filter does not trigger a new search', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'option', { name: 'All' } ) );

			expect( apiClient.searchIssues ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Repo filter', () => {
		test( 'Clicking the Repository button opens the repo filter dialog', async () => {
			setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );

			expect(
				screen.getByRole( 'dialog', { name: 'Repository filter popover' } )
			).toBeInTheDocument();
		} );

		test( 'If no repos are selected, popover launches to default mode', async () => {
			setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );

			expect(
				screen.getByRole( 'option', { name: 'Default', selected: true } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Default filter mode' } ) ).toBeInTheDocument();
		} );

		test( 'If repos are selected, popover launches to manual mode, with the filters checked', async () => {
			const selectedRepos = [ availableRepoFilters[ 0 ], availableRepoFilters[ 2 ] ];
			setup( <DuplicateSearchControls />, {
				...defaultInitialSearchState,
				activeRepoFilters: selectedRepos,
			} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );

			expect(
				screen.getByRole( 'option', { name: 'Manual', selected: true } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Manual filter mode' } ) ).toBeInTheDocument();

			for ( const selectedRepo of selectedRepos ) {
				expect(
					screen.getByRole( 'checkbox', { name: getRepoNameFromFullName( selectedRepo ) } )
				).toBeChecked();
			}
		} );

		test( 'Clicking the filter mode control switches the filter mode', async () => {
			setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );

			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			expect(
				screen.getByRole( 'option', { name: 'Manual', selected: true } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Manual filter mode' } ) ).toBeInTheDocument();

			await userEvent.click( screen.getByRole( 'option', { name: 'Default' } ) );
			expect(
				screen.getByRole( 'option', { name: 'Default', selected: true } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Default filter mode' } ) ).toBeInTheDocument();
		} );

		test( 'In manual mode, the repos are sorted alphabetically, and broken up by organization', async () => {
			setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );

			expect(
				screen.getByRole( 'list', { name: 'List of repository filters by organization' } ).children
			).toHaveLength( 2 );
			expect(
				screen.getByRole( 'list', {
					name: `List of repositories for xyzOrg organization`,
				} ).children
			).toHaveLength( 2 );
			expect(
				screen.getByRole( 'list', {
					name: `List of repositories for abcOrg organization`,
				} ).children
			).toHaveLength( 1 );

			const allListItems = screen.getAllByRole( 'listitem' );
			expect( allListItems[ 0 ] ).toHaveTextContent( 'abcOrg' );
			expect( allListItems[ 1 ] ).toHaveTextContent( 'otherRepo' );
			expect( allListItems[ 2 ] ).toHaveTextContent( 'xyzOrg' );
			expect( allListItems[ 3 ] ).toHaveTextContent( 'abcRepo' );
			expect( allListItems[ 4 ] ).toHaveTextContent( 'xyzRepo' );
		} );

		test( 'Clicking "Cancel" closes popover, but does not fire a new search or save repos', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			await userEvent.click(
				screen.getByRole( 'checkbox', {
					name: getRepoNameFromFullName( availableRepoFilters[ 0 ] ),
				} )
			);
			await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

			// Popover closed
			expect(
				screen.queryByRole( 'dialog', { name: 'Repository filter popover' } )
			).not.toBeInTheDocument();

			// No search
			expect( apiClient.searchIssues ).not.toHaveBeenCalled();

			// Validate no state was saved
			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			expect( screen.getByRole( 'heading', { name: 'Default filter mode' } ) ).toBeInTheDocument();
		} );

		test( 'Clicking "Filter" closes popover and fires a new search', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Filter' } ) );

			expect(
				screen.queryByRole( 'dialog', { name: 'Repository filter popover' } )
			).not.toBeInTheDocument();
			expect( apiClient.searchIssues ).toHaveBeenCalled();
		} );

		test( 'Filtering on default mode searches with no repo filters', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Filter' } ) );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith(
				defaultInitialSearchState.searchTerm,
				expect.objectContaining( {
					repos: [],
				} )
			);
		} );

		test( 'Filtering on manual mode with nothing selected searches with no repo filters', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Filter' } ) );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith(
				defaultInitialSearchState.searchTerm,
				expect.objectContaining( {
					repos: [],
				} )
			);
		} );

		test( 'Filtering on manual mode with repos selected searches with the checked repos', async () => {
			const { apiClient } = setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			await userEvent.click(
				screen.getByRole( 'checkbox', {
					name: getRepoNameFromFullName( availableRepoFilters[ 0 ] ),
				} )
			);
			await userEvent.click(
				screen.getByRole( 'checkbox', {
					name: getRepoNameFromFullName( availableRepoFilters[ 1 ] ),
				} )
			);
			await userEvent.click( screen.getByRole( 'button', { name: 'Filter' } ) );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith(
				defaultInitialSearchState.searchTerm,
				expect.objectContaining( {
					repos: [ availableRepoFilters[ 0 ], availableRepoFilters[ 1 ] ],
				} )
			);
		} );

		test( 'In manual mode, clicking "Select all" selects all repos', async () => {
			setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Select all' } ) );

			for ( const availableRepoFilter of availableRepoFilters ) {
				expect(
					screen.getByRole( 'checkbox', {
						name: getRepoNameFromFullName( availableRepoFilter ),
					} )
				).toBeChecked();
			}
		} );

		test( 'In manual mode, clicking "Deselect all" deselects all repos', async () => {
			setup( <DuplicateSearchControls /> );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			await userEvent.click(
				screen.getByRole( 'checkbox', {
					name: getRepoNameFromFullName( availableRepoFilters[ 0 ] ),
				} )
			);
			await userEvent.click( screen.getByRole( 'button', { name: 'Deselect all' } ) );

			expect( screen.queryByRole( 'checkbox', { checked: true } ) ).not.toBeInTheDocument();
		} );

		test( 'With saved repos selected, the repo filter button has "data-active" attribute set to "true", and correct description', async () => {
			const selectedRepos = [ availableRepoFilters[ 0 ], availableRepoFilters[ 2 ] ];
			setup( <DuplicateSearchControls />, {
				...defaultInitialSearchState,
				activeRepoFilters: selectedRepos,
			} );

			expect( screen.getByRole( 'button', { name: 'Repository filter' } ) ).toHaveAttribute(
				'data-active',
				'true'
			);
			expect(
				screen.getByRole( 'button', {
					name: 'Repository filter',
					description: 'Manual custom repository filter is active.',
				} )
			).toBeInTheDocument();
		} );

		test( 'With no saved repo filters, the repo filter button has "data-active" attribute set to "false", and correct description', async () => {
			setup( <DuplicateSearchControls /> );

			expect( screen.getByRole( 'button', { name: 'Repository filter' } ) ).toHaveAttribute(
				'data-active',
				'false'
			);
			expect(
				screen.getByRole( 'button', {
					name: 'Repository filter',
					description: 'Default repository filter is active.',
				} )
			).toBeInTheDocument();
		} );
	} );
} );
