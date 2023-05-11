import React, { ReactElement } from 'react';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { DuplicateSearchControls } from '../duplicate-search-controls';
import { screen, waitFor } from '@testing-library/react';
import { DuplicateSearchState } from '../types';
import { RootState } from '../../app/store';
import { AvailableRepoFiltersState } from '../../static-data/available-repo-filters/types';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

// For some list assertions, this is really our best option, so ignoring in this file.
/* eslint-disable testing-library/no-node-access */

describe( '[DuplicateSearchControls]', () => {
	const availableRepoFilters = [ 'xyzOrg/xyzRepo', 'xyzOrg/abcRepo', 'abcOrg/otherRepo' ];
	const defaultAvailableRepoFiltersState: AvailableRepoFiltersState = {
		repos: availableRepoFilters,
		loadError: null,
	};
	const defaultInitialSearchState: DuplicateSearchState = {
		searchTerm: '',
		statusFilter: 'all',
		activeRepoFilters: [],
		sort: 'relevance',
	};
	const searchStateWithSearchTerm: DuplicateSearchState = {
		...defaultInitialSearchState,
		searchTerm: 'foo bar',
	};

	function setup( component: ReactElement, preLoadedState?: Partial< RootState > ) {
		const apiClient = createMockApiClient();
		const monitoringClient = createMockMonitoringClient();
		const user = userEvent.setup();

		const initialSearchState = preLoadedState?.duplicateSearch ?? defaultInitialSearchState;
		const availableRepoFilterState =
			preLoadedState?.availableRepoFilters ?? defaultAvailableRepoFiltersState;
		const view = renderWithProviders( component, {
			apiClient,
			monitoringClient,
			preloadedState: {
				duplicateSearch: initialSearchState,
				availableRepoFilters: availableRepoFilterState,
			},
		} );

		if ( preLoadedState?.duplicateSearch ) {
			// When we start with pre-loaded state, we kick off an initial search.
			apiClient.searchIssues.mockClear();
		}

		return {
			user,
			apiClient,
			monitoringClient,
			...view,
		};
	}

	function getRepoNameFromFullName( fullName: string ) {
		return fullName.split( '/' )[ 1 ];
	}

	describe( 'Search input', () => {
		async function search( user: ReturnType< typeof userEvent.setup >, searchTerm: string ) {
			await user.click( screen.getByRole( 'textbox', { name: 'Search for duplicate issues' } ) );
			await user.keyboard( searchTerm );
			// Bypass debouncing by hitting enter
			await user.keyboard( '{Enter}' );
		}

		test( 'If you enter a search term, it searches for it', async () => {
			const { user, apiClient } = setup( <DuplicateSearchControls /> );

			await search( user, 'foo' );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith( 'foo', expect.anything() );
		} );

		test( "If you search for only white space, it doesn't search", async () => {
			const { user, apiClient } = setup( <DuplicateSearchControls /> );

			await search( user, ' ' );

			expect( apiClient.searchIssues ).not.toHaveBeenCalled();
		} );

		test( "If you clear the field, it doesn't search again", async () => {
			const { user, apiClient } = setup( <DuplicateSearchControls /> );

			await search( user, 'foo' );

			await user.clear( screen.getByRole( 'textbox', { name: 'Search for duplicate issues' } ) );
			await user.keyboard( '{Enter}' );

			expect( apiClient.searchIssues ).toHaveBeenCalledTimes( 1 );
		} );

		test( "If you change another parameter while the search input is empty, it doesn't search", async () => {
			const { user, apiClient } = setup( <DuplicateSearchControls /> );

			await user.click( screen.getByRole( 'option', { name: 'Open' } ) );

			expect( apiClient.searchIssues ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Status filter', () => {
		test( 'By default the "All" filter is selected', () => {
			setup( <DuplicateSearchControls /> );

			expect( screen.getByRole( 'option', { name: 'All', selected: true } ) ).toBeInTheDocument();
		} );

		test( 'Selecting a new status filter marks that status as selected', async () => {
			const { user } = setup( <DuplicateSearchControls /> );

			await user.click( screen.getByRole( 'option', { name: 'Open' } ) );

			expect( screen.getByRole( 'option', { name: 'Open', selected: true } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'All', selected: false } ) ).toBeInTheDocument();
		} );

		test( 'Selecting a new filter triggers a new search with the selected status filter', async () => {
			const { apiClient, user } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

			await user.click( screen.getByRole( 'option', { name: 'Closed' } ) );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith( searchStateWithSearchTerm.searchTerm, {
				status: 'closed',
				sort: defaultInitialSearchState.sort,
				repos: defaultInitialSearchState.activeRepoFilters,
			} );
		} );

		test( 'Selecting the same filter does not trigger a new search', async () => {
			const { apiClient, user } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

			await user.click( screen.getByRole( 'option', { name: 'All' } ) );

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
				duplicateSearch: { ...defaultInitialSearchState, activeRepoFilters: selectedRepos },
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
			const { apiClient } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

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
			const { apiClient } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Filter' } ) );

			expect(
				screen.queryByRole( 'dialog', { name: 'Repository filter popover' } )
			).not.toBeInTheDocument();
			expect( apiClient.searchIssues ).toHaveBeenCalled();
		} );

		test( 'Filtering on default mode searches with no repo filters', async () => {
			const { apiClient } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Filter' } ) );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith(
				searchStateWithSearchTerm.searchTerm,
				expect.objectContaining( {
					repos: [],
				} )
			);
		} );

		test( 'Filtering on manual mode with nothing selected searches with no repo filters', async () => {
			const { apiClient } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			await userEvent.click( screen.getByRole( 'button', { name: 'Filter' } ) );

			expect( apiClient.searchIssues ).toHaveBeenCalledWith(
				searchStateWithSearchTerm.searchTerm,
				expect.objectContaining( {
					repos: [],
				} )
			);
		} );

		test( 'Filtering on manual mode with repos selected searches with the checked repos', async () => {
			const { apiClient } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

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
				searchStateWithSearchTerm.searchTerm,
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

			for ( const availableRepoFilter of availableRepoFilters ) {
				await userEvent.click(
					screen.getByRole( 'checkbox', {
						name: getRepoNameFromFullName( availableRepoFilter ),
					} )
				);
			}

			await userEvent.click( screen.getByRole( 'button', { name: 'Deselect all' } ) );

			expect( screen.queryByRole( 'checkbox', { checked: true } ) ).not.toBeInTheDocument();
		} );

		test( 'With saved repos selected, the repo filter button has "data-active" attribute set to "true", and correct description', async () => {
			const selectedRepos = [ availableRepoFilters[ 0 ], availableRepoFilters[ 2 ] ];
			setup( <DuplicateSearchControls />, {
				duplicateSearch: { ...defaultInitialSearchState, activeRepoFilters: selectedRepos },
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

		test( 'If there was an error loading available filters, we show an error message and log an error', async () => {
			const errorMessage = 'Repo filter load error.';
			const { monitoringClient } = setup( <DuplicateSearchControls />, {
				availableRepoFilters: { repos: [], loadError: errorMessage },
			} );

			await userEvent.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await userEvent.click( screen.getByRole( 'option', { name: 'Manual' } ) );

			expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
				'error loading the list of available repository filters'
			);
			expect( monitoringClient.logger.error ).toHaveBeenCalledWith(
				'Error loading available repo filters',
				{ error: 'Repo filter load error.' }
			);
		} );
	} );

	describe( 'Sort selection', () => {
		test( 'By default, we sort by Relevance', async () => {
			setup( <DuplicateSearchControls /> );

			expect( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) ).toHaveTextContent(
				'Relevance'
			);
		} );

		test( 'Clicking "Sort results by…" opens a popover with sort options', async () => {
			const { user } = setup( <DuplicateSearchControls /> );

			await user.click( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) );

			expect( screen.getByRole( 'listbox', { name: 'Sort options' } ) ).toBeInTheDocument();

			const expectedSortOptions = [ 'Relevance', 'Date added' ];
			for ( const expectedSortOption of expectedSortOptions ) {
				expect( screen.getByRole( 'option', { name: expectedSortOption } ) ).toBeInTheDocument();
			}
		} );

		test( 'Selecting a sort option, closes popover, saves option, and fires search', async () => {
			const { user, apiClient } = setup( <DuplicateSearchControls />, {
				duplicateSearch: searchStateWithSearchTerm,
			} );

			await user.click( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) );
			await user.click( screen.getByRole( 'option', { name: 'Date added' } ) );

			expect( screen.queryByRole( 'listbox', { name: 'Sort options' } ) ).not.toBeInTheDocument();
			expect( apiClient.searchIssues ).toHaveBeenCalledWith(
				searchStateWithSearchTerm.searchTerm,
				expect.objectContaining( {
					sort: 'date-created',
				} )
			);
			expect( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) ).toHaveTextContent(
				'Date added'
			);
		} );

		test( 'The currently saved sort option is selected in the dropdown', async () => {
			const { user } = setup( <DuplicateSearchControls />, {
				duplicateSearch: { ...defaultInitialSearchState, sort: 'date-created' },
			} );

			await user.click( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) );

			expect(
				screen.getByRole( 'option', { name: 'Date added', selected: true } )
			).toBeInTheDocument();
		} );

		test( 'The control supports keyboard arrow navigation', async () => {
			const { user } = setup( <DuplicateSearchControls /> );

			const sortButton = screen.getByRole( 'combobox', { name: 'Sort results by…' } );
			sortButton.focus();

			await user.keyboard( '{arrowdown}' );
			expect( screen.getByRole( 'listbox', { name: 'Sort options' } ) ).toBeInTheDocument();
			await waitFor( () =>
				expect( screen.getByRole( 'option', { name: 'Relevance', selected: true } ) ).toHaveFocus()
			);

			await user.keyboard( '{arrowdown}' );
			await waitFor( () =>
				expect(
					screen.getByRole( 'option', { name: 'Date added', selected: false } )
				).toHaveFocus()
			);
		} );

		test( 'When open, the control supports type-ahead searching', async () => {
			const { user } = setup( <DuplicateSearchControls /> );

			const sortButton = screen.getByRole( 'combobox', { name: 'Sort results by…' } );
			sortButton.focus();

			// Using space to open the listbox as this would be a common workflow for screen reader users
			await user.keyboard( ' ' );
			await user.keyboard( 'd' );
			await waitFor( () =>
				expect(
					screen.getByRole( 'option', { name: 'Date added', selected: false } )
				).toHaveFocus()
			);
		} );
	} );
} );
