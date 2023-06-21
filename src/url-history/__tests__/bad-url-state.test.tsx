/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import history from 'history/browser';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { App } from '../../app/app';
import { waitForElementToBeRemoved, screen } from '@testing-library/react';
import { AvailableRepoFiltersApiResponse, ReportingConfigApiResponse } from '../../api/types';
import { stateToQuery } from '../parsers';
import { RootState } from '../../app/store';
import { normalizeReportingConfig } from '../../static-data/reporting-config/reporting-config-parsers';

describe( '[Bad URL State]', () => {
	const fakeReportingConfigApiResponse: ReportingConfigApiResponse = {
		Product: {
			features: {
				Feature: {
					tasks: {
						bug: [
							{
								title: 'Task title',
							},
						],
						featureRequest: [],
						urgent: [],
					},
				},
			},
		},
	};

	const normalizedReference = normalizeReportingConfig( fakeReportingConfigApiResponse );
	const expectedFeatureId = Object.keys( normalizedReference.features )[ 0 ];

	const fakeAvailableRepoFiltersResponse: AvailableRepoFiltersApiResponse = [ 'fakeOrg/fakeRepo' ];

	async function setup( urlQuery: string ) {
		history.replace( `?${ urlQuery }` );
		const apiClient = createMockApiClient();
		apiClient.loadReportingConfig.mockResolvedValue( fakeReportingConfigApiResponse );
		apiClient.loadAvailableRepoFilters.mockResolvedValue( fakeAvailableRepoFiltersResponse );
		renderWithProviders( <App />, { apiClient } );
		await waitForElementToBeRemoved(
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);
	}

	let errorSpy: jest.SpyInstance;

	beforeEach( () => {
		errorSpy = jest.spyOn( console, 'error' );
	} );

	afterEach( () => {
		errorSpy.mockRestore();
	} );

	function expectNoErrorThrown() {
		expect( errorSpy ).not.toHaveBeenCalled();
		expect(
			screen.queryByRole( 'alert', { name: 'Uh oh! Something went wrong :(' } )
		).not.toBeInTheDocument();
	}

	function validateDefaultDuplicateSearchState() {
		// Page
		expect(
			screen.getByRole( 'heading', { name: 'Search for duplicate issues' } )
		).toBeInTheDocument();

		// Controls
		expect( screen.getByRole( 'textbox', { name: 'Search for duplicate issues' } ) ).toHaveValue(
			''
		);
		expect( screen.getByRole( 'option', { name: 'All', selected: true } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Repository filter' } ) ).toHaveAttribute(
			'data-active',
			'false'
		);
		expect( screen.getByRole( 'combobox', { name: 'Sort results by…' } ) ).toHaveTextContent(
			'Relevance'
		);

		// Results
		expect(
			screen.getByRole( 'heading', { name: 'Enter some keywords to search for duplicates.' } )
		).toBeInTheDocument();
	}

	describe( 'Falls back to initial state when recieves bad URL state with...', () => {
		// TODO: Expand coverage for issue searching related state

		test( "Feature ID that isn't in the reporting config", async () => {
			const urlQuery = stateToQuery( {
				issueDetails: {
					featureId: 'not-a-real-feature-id',
					issueType: 'unset',
					issueTitle: '',
				},
				activePage: 'report-issue',
				activeReportingStep: 'feature',
			} as RootState );

			await setup( urlQuery );

			expectNoErrorThrown();
			expect(
				screen.queryByRole( 'button', { name: 'Clear currently selected feature' } )
			).not.toBeInTheDocument();
		} );

		test( 'Issue type that is not part of the predefined list', async () => {
			const urlQuery = stateToQuery( {
				issueDetails: {
					featureId: expectedFeatureId,
					issueType: 'not-a-real-issue-type' as any,
					issueTitle: '',
				},
				activePage: 'report-issue',
				activeReportingStep: 'type',
			} as RootState );

			await setup( urlQuery );

			expectNoErrorThrown();
			expect( screen.queryByRole( 'radio', { checked: true } ) ).not.toBeInTheDocument();
		} );

		test( 'Active reporting step that is not part of the predefined list', async () => {
			const urlQuery = stateToQuery( {
				activeReportingStep: 'not-a-real-step' as any,
				activePage: 'report-issue',
			} as RootState );

			await setup( urlQuery );

			expectNoErrorThrown();
			expect( screen.getByRole( 'form', { name: 'Set issue type' } ) ).toBeInTheDocument();
		} );

		test( 'Completed task ID that is not in the reporting config', async () => {
			const urlQuery = stateToQuery( {
				issueDetails: {
					featureId: expectedFeatureId,
					issueType: 'bug',
					issueTitle: '',
				},
				activePage: 'report-issue',
				activeReportingStep: 'next-steps',
				completedTasks: [ 'not-an-id' ],
			} as RootState );

			await setup( urlQuery );

			expectNoErrorThrown();
			expect( screen.queryByRole( 'checkbox', { checked: true } ) ).not.toBeInTheDocument();
		} );

		test( 'Issue search options that are invalid options', async () => {
			const urlQuery = stateToQuery( {
				duplicateSearch: {
					searchTerm: [],
					activeRepoFilters: [ 'not-available-repo' ],
					sort: 'not-a-valid-sort-option',
					statusFilter: 'not-a-valid-status-filter',
				} as any,
			} as RootState );

			await setup( urlQuery );

			expectNoErrorThrown();

			validateDefaultDuplicateSearchState();
		} );

		test( 'Invalid types for all the top-level tracked state fields', async () => {
			const urlQuery = stateToQuery( {
				issueDetails: { foo: 'bar' } as any,
				activeReportingStep: { foo: 'bar' } as any,
				completedTasks: { foo: 'bar' } as any,
				activePage: { foo: 'bar' } as any,
				duplicateSearch: { foo: 'bar' } as any,
			} as RootState );

			await setup( urlQuery );

			expectNoErrorThrown();

			validateDefaultDuplicateSearchState();
		} );

		test( 'Undefined for all the top-level tracked state fields', async () => {
			const urlQuery = stateToQuery( {
				issueDetails: undefined as any,
				activeReportingStep: undefined as any,
				completedTasks: undefined as any,
				activePage: undefined as any,
				duplicateSearch: undefined as any,
			} as RootState );

			await setup( urlQuery );

			expectNoErrorThrown();

			validateDefaultDuplicateSearchState();
		} );
	} );

	test( 'Displays error message and start over button when active step is "Next Steps", but we are missing info', async () => {
		const urlQuery = stateToQuery( {
			issueDetails: {
				featureId: 'invalidId',
				issueType: 'bug',
				issueTitle: '',
			},
			activeReportingStep: 'next-steps',
			activePage: 'report-issue',
		} as RootState );

		await setup( urlQuery );

		expectNoErrorThrown();

		expect(
			screen.getByText( 'Hmm, we seem to be missing some information', { exact: false } )
		).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Start Over' } ) ).toBeInTheDocument();
	} );
} );
