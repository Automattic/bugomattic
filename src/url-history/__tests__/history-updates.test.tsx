/**
 * @jest-environment ./src/test-utils/faux-e2e-environment.ts
 */

import '@testing-library/react/dont-cleanup-after-each';
import { cleanup, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import {
	AvailableRepoFiltersApiResponse,
	ReportingConfigApiResponse,
	SearchIssueOptions,
} from '../../api/types';
import { App } from '../../app/app';
import history from 'history/browser';
import { IssueSearchState, IssueSortOption, IssueStatusFilter } from '../../issue-search/types';
import { Issue } from '../../issue-search-results/types';

globalThis.scrollTo = jest.fn();

/*
This is a weird test, but it's design is very intentional!
We want to avoid testing the nuance of how we track state in the URL query params.
What we care about is... 
1. The URL does change at certain points in the app lifecycle, and...
2. When we reload those URLs later, we land in the same state we were in before.

So, we first go through a basic flow of the app. As we do, we cache the URLs at certain points in time.

Then, we reload those URLs later, and ensure we can pass the same set of validations for that point in time.
*/

describe( 'history updates', () => {
	const productName = 'Product';
	const featureName = 'Unique feature name';
	const taskName = 'Task Title';
	const fakeReportingConfigApiResponse: ReportingConfigApiResponse = {
		[ productName ]: {
			features: {
				[ featureName ]: {
					tasks: {
						bug: [],
						featureRequest: [
							{
								title: taskName,
							},
						],
						urgent: [],
					},
				},
			},
		},
	};
	const fakeAvailableRepoFiltersResponse: AvailableRepoFiltersApiResponse = [ 'fakeOrg/fakeRepo' ];
	const newSearchTerm = 'foo';
	const newStatusFilter: IssueStatusFilter = 'open';
	const newRepoFilters: string[] = [ ...fakeAvailableRepoFiltersResponse ];
	const newSort: IssueSortOption = 'date-created';

	const pointsInTime = [
		'onStart',
		'onSearchTermChange',
		'onStatusFilterChange',
		'onRepoFilterChange',
		'onSortChange',
		'onReportingFlowStart',
		'onFeatureSelectionComplete',
		'onFirstTaskComplete',
		'onFirstTaskUnComplete',
		'onFeatureSelectionEdit',
		'onTypeEdit',
		'onStartOver',
	] as const;

	type PointInTime = typeof pointsInTime[ number ];

	function createFakeIssueContentFromSearchState( searchState: IssueSearchState ) {
		const { searchTerm, statusFilter, activeRepoFilters, sort } = searchState;

		return `search:${ searchTerm } status:${ statusFilter } repos:${ activeRepoFilters.join(
			','
		) } sort:${ sort }`;
	}

	const mockSearchIssuesImplementation = async ( search: string, options?: SearchIssueOptions ) => {
		const fakeIssue: Issue = {
			title: 'fake title',
			url: 'https://github.com/test/test/issues/1',
			content: createFakeIssueContentFromSearchState( {
				searchTerm: search,
				statusFilter: options?.status || 'all',
				activeRepoFilters: options?.repos || [],
				sort: options?.sort || 'relevance',
			} ),
			status: 'open',
			dateCreated: new Date().toISOString(),
			dateUpdated: new Date().toISOString(),
			author: 'fake author',
			repo: 'fakeOrg/fakeRepo',
		};

		return [ fakeIssue ];
	};

	function toTitleCase( str: string ) {
		return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
	}

	function validateSearchControlsForExpectedState( searchState: IssueSearchState ) {
		const { searchTerm, statusFilter, activeRepoFilters, sort } = searchState;

		expect( screen.getByRole( 'textbox', { name: 'Search for existing issues' } ) ).toHaveValue(
			searchTerm
		);

		expect(
			screen.getByRole( 'option', { name: toTitleCase( statusFilter ), selected: true } )
		).toBeInTheDocument();

		expect( screen.getByRole( 'button', { name: 'Repository filter' } ) ).toHaveAttribute(
			'data-active',
			activeRepoFilters.length > 0 ? 'true' : 'false'
		);

		const expectedSortText = sort === 'relevance' ? 'Relevance' : 'Date created';
		expect( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) ).toHaveTextContent(
			expectedSortText
		);
	}

	function validateSearchResultsForExpectedState( searchState: IssueSearchState ) {
		if ( searchState.searchTerm === '' ) {
			expect(
				screen.getByRole( 'heading', {
					name: 'Enter some keywords to search for existing issues.',
				} )
			).toBeInTheDocument();
		} else {
			expect(
				screen.getByText( createFakeIssueContentFromSearchState( searchState ) )
			).toBeInTheDocument();
		}
	}

	const actions: { [ key in PointInTime ]: () => Promise< void > } = {
		onStart: async () => {
			return;
		},

		onSearchTermChange: async () => {
			await user.click( screen.getByRole( 'textbox', { name: 'Search for existing issues' } ) );
			await user.keyboard( newSearchTerm );
			await user.keyboard( '{enter}' );
		},

		onStatusFilterChange: async () => {
			await user.click( screen.getByRole( 'option', { name: 'Open' } ) );
		},

		onRepoFilterChange: async () => {
			await user.click( screen.getByRole( 'button', { name: 'Repository filter' } ) );
			await user.click( screen.getByRole( 'option', { name: 'Manual' } ) );
			await user.click(
				screen.getByRole( 'checkbox', { name: newRepoFilters[ 0 ].split( '/' )[ 1 ] } )
			);
			await user.click( screen.getByRole( 'button', { name: 'Filter' } ) );
		},

		onSortChange: async () => {
			await user.click( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) );
			await user.click( screen.getByRole( 'option', { name: 'Date created' } ) );
		},

		onReportingFlowStart: async () => {
			await user.click( screen.getByRole( 'menuitem', { name: 'Report an Issue' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Request a new feature' } ) );
		},

		onFeatureSelectionComplete: async () => {
			await user.click( screen.getByRole( 'button', { name: productName } ) );
			await user.click( screen.getByRole( 'option', { name: featureName } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		},

		onFirstTaskComplete: async () => {
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: false } ) );
			await screen.findByRole( 'checkbox', { name: taskName, checked: true } );
		},

		onFirstTaskUnComplete: async () => {
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: true } ) );
		},

		onFeatureSelectionEdit: async () => {
			await user.click(
				screen.getByRole( 'button', {
					name: 'Edit',
					description: /Product and Feature/,
				} )
			);
		},

		onTypeEdit: async () => {
			await user.click(
				screen.getByRole( 'button', {
					name: 'Edit',
					description: /Type/,
				} )
			);
		},

		onStartOver: async () => {
			// We have to complete all tasks to get the Start Over button to appear
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: false } ) );
			await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Report a new issue' } ) );
		},
	};

	const validations: { [ key in PointInTime ]: () => Promise< void > } = {
		onStart: async () => {
			expect(
				screen.getByRole( 'heading', { name: 'Search for existing issues' } )
			).toBeInTheDocument();

			const expectedSearchState: IssueSearchState = {
				searchTerm: '',
				statusFilter: 'all',
				activeRepoFilters: [],
				sort: 'relevance',
			};

			validateSearchControlsForExpectedState( expectedSearchState );
			validateSearchResultsForExpectedState( expectedSearchState );
		},

		onSearchTermChange: async () => {
			const expectedSearchState: IssueSearchState = {
				searchTerm: newSearchTerm,
				statusFilter: 'all',
				activeRepoFilters: [],
				sort: 'relevance',
			};

			validateSearchControlsForExpectedState( expectedSearchState );
			validateSearchResultsForExpectedState( expectedSearchState );
		},

		onStatusFilterChange: async () => {
			const expectedSearchState: IssueSearchState = {
				searchTerm: newSearchTerm,
				statusFilter: newStatusFilter,
				activeRepoFilters: [],
				sort: 'relevance',
			};

			validateSearchControlsForExpectedState( expectedSearchState );
			validateSearchResultsForExpectedState( expectedSearchState );
		},

		onRepoFilterChange: async () => {
			const expectedSearchState: IssueSearchState = {
				searchTerm: newSearchTerm,
				statusFilter: newStatusFilter,
				activeRepoFilters: newRepoFilters,
				sort: 'relevance',
			};

			validateSearchControlsForExpectedState( expectedSearchState );
			validateSearchResultsForExpectedState( expectedSearchState );
		},

		onSortChange: async () => {
			const expectedSearchState: IssueSearchState = {
				searchTerm: newSearchTerm,
				statusFilter: newStatusFilter,
				activeRepoFilters: newRepoFilters,
				sort: newSort,
			};

			validateSearchControlsForExpectedState( expectedSearchState );
			validateSearchResultsForExpectedState( expectedSearchState );
		},

		onReportingFlowStart: async () => {
			expect( screen.getByRole( 'heading', { name: 'Report a new issue' } ) ).toBeInTheDocument();
			expect(
				screen.queryByRole( 'heading', { name: 'Search for existing issues' } )
			).not.toBeInTheDocument();

			// Coming from issue searching, we start with the type already filled in, and on feature selection
			expect( screen.getByRole( 'heading', { name: 'Completed step: Type' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
		},

		onFeatureSelectionComplete: async () => {
			expect( screen.getByRole( 'heading', { name: 'Completed step: Type' } ) ).toBeInTheDocument();

			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();
			expect( screen.getByText( `${ productName } > ${ featureName }` ) ).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},

		onFirstTaskComplete: async () => {
			expect( screen.getByRole( 'heading', { name: 'Completed step: Type' } ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'checkbox', { name: taskName, checked: true } )
			).toBeInTheDocument();
		},

		onFirstTaskUnComplete: async () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Completed step: Type' } ) ).toBeInTheDocument();

			expect(
				screen.getByRole( 'checkbox', { name: taskName, checked: false } )
			).toBeInTheDocument();
		},

		onFeatureSelectionEdit: async () => {
			expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
			// We have to do an async wait on this one because we actually don't set the feature selector form state directly from the URL.
			// It's really "local" state that we store in redux to avoid prop drilling.
			// So it is updated on render from the issueFeatureId. This means another render loop has to run.
			expect(
				await screen.findByRole( 'button', { name: 'Clear currently selected feature' } )
			).toBeInTheDocument(); // The current feature should still be selected

			expect( screen.getByRole( 'heading', { name: 'Completed step: Type' } ) ).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},

		onTypeEdit: async () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();

			expect( screen.getByRole( 'form', { name: 'Set issue type' } ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'radio', { name: 'Feature Request', checked: true } )
			).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},

		onStartOver: async () => {
			expect( screen.getByRole( 'form', { name: 'Set issue type' } ) ).toBeInTheDocument();

			expect( screen.queryByRole( 'form', { name: 'Select a feature' } ) ).not.toBeInTheDocument();
			expect( screen.queryByText( featureName ) ).not.toBeInTheDocument();

			expect(
				screen.queryByRole( 'list', { name: 'Steps to report issue' } )
			).not.toBeInTheDocument();
		},
	};

	const referenceUrlQueries: { [ key in PointInTime ]: string } = {
		onStart: 'WILL BE SET IN TEST',
		onSearchTermChange: 'WILL BE SET IN TEST',
		onStatusFilterChange: 'WILL BE SET IN TEST',
		onRepoFilterChange: 'WILL BE SET IN TEST',
		onSortChange: 'WILL BE SET IN TEST',
		onReportingFlowStart: 'WILL BE SET IN TEST',
		onFeatureSelectionComplete: 'WILL BE SET IN TEST',
		onFirstTaskComplete: 'WILL BE SET IN TEST',
		onFirstTaskUnComplete: 'WILL BE SET IN TEST',
		onFeatureSelectionEdit: 'WILL BE SET IN TEST',
		onTypeEdit: 'WILL BE SET IN TEST',
		onStartOver: 'WILL BE SET IN TEST',
	};

	let user: UserEvent;
	beforeAll( async () => {
		const apiClient = createMockApiClient();
		user = userEvent.setup();
		apiClient.loadReportingConfig.mockResolvedValue( fakeReportingConfigApiResponse );
		apiClient.loadAvailableRepoFilters.mockResolvedValue( fakeAvailableRepoFiltersResponse );
		apiClient.searchIssues.mockImplementation( mockSearchIssuesImplementation );
		// eslint-disable-next-line testing-library/no-render-in-setup
		renderWithProviders( <App />, { apiClient } );
		await waitForElementToBeRemoved(
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);
	} );

	describe( 'Set point in time reference url queries and ensure history change', () => {
		pointsInTime.forEach( ( pointInTime, index ) => {
			test( pointInTime, async () => {
				await actions[ pointInTime ]();
				await validations[ pointInTime ]();

				referenceUrlQueries[ pointInTime ] = history.location.search;
				if ( index > 0 ) {
					// Nothing to compare for first point in time
					expect( referenceUrlQueries[ pointInTime ] ).not.toBe(
						referenceUrlQueries[ pointsInTime[ index - 1 ] ]
					);
				}
			} );
		} );
	} );

	describe( 'Recreating state from query params', () => {
		// We are now rerendering in each test, so we need to do a first cleanup,
		// and then a cleanup after each test.
		beforeAll( cleanup );
		afterEach( cleanup );

		async function setup( urlQuery: string ) {
			history.replace( urlQuery );
			const apiClient = createMockApiClient();
			apiClient.loadReportingConfig = jest.fn().mockResolvedValue( fakeReportingConfigApiResponse );
			apiClient.loadAvailableRepoFilters.mockResolvedValue( fakeAvailableRepoFiltersResponse );
			apiClient.searchIssues.mockImplementation( mockSearchIssuesImplementation );
			renderWithProviders( <App />, { apiClient } );
			await waitForElementToBeRemoved(
				screen.queryByRole( 'alert', { name: 'Loading required app data' } )
			);
		}

		pointsInTime.forEach( ( pointInTime ) => {
			test( pointInTime, async () => {
				const urlQuery = referenceUrlQueries[ pointInTime ];

				await setup( urlQuery );
				await validations[ pointInTime ]();
			} );
		} );
	} );
} );
