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
import { ReportingConfigApiResponse } from '../../api/types';
import { App } from '../../app/app';
import history from 'history/browser';

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

	// TODO: Expand with some more steps in duplicate searching
	const pointsInTime = [
		'onStart',
		'onReportingFlowStart',
		'onTypeComplete',
		'onFeatureSelectionComplete',
		'onFirstTaskComplete',
		'onFirstTaskUnComplete',
		'onFeatureSelectionEdit',
		'onTypeEdit',
		'onStartOver',
	] as const;

	type PointInTime = typeof pointsInTime[ number ];

	const validations: { [ key in PointInTime ]: () => Promise< void > } = {
		onStart: async () => {
			expect(
				screen.getByRole( 'heading', { name: 'Search for duplicate issues' } )
			).toBeInTheDocument();

			expect( screen.queryByRole( 'form', { name: 'Set issue type' } ) ).not.toBeInTheDocument();
		},

		onReportingFlowStart: async () => {
			expect( screen.getByRole( 'form', { name: 'Set issue type' } ) ).toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: 'Steps to report issue' } )
			).not.toBeInTheDocument();

			expect( screen.queryByRole( 'form', { name: 'Select a feature' } ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'list', { name: 'Clear currently selected feature' } )
			).not.toBeInTheDocument();

			expect(
				screen.queryByRole( 'heading', { name: 'Search for duplicate issues' } )
			).not.toBeInTheDocument();
		},

		onTypeComplete: async () => {
			expect( screen.getByRole( 'heading', { name: 'Completed step: Type' } ) ).toBeInTheDocument();

			expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
			expect( screen.getByText( 'Feature Request' ) ).toBeInTheDocument();

			expect(
				screen.queryByRole( 'list', { name: 'Steps to report issue' } )
			).not.toBeInTheDocument();
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
		onReportingFlowStart: 'WILL BE SET IN TEST',
		onFeatureSelectionComplete: 'WILL BE SET IN TEST',
		onTypeComplete: 'WILL BE SET IN TEST',
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
		apiClient.loadReportingConfig = jest.fn().mockResolvedValue( fakeReportingConfigApiResponse );
		// eslint-disable-next-line testing-library/no-render-in-setup
		renderWithProviders( <App />, { apiClient } );
		await waitForElementToBeRemoved(
			screen.queryByRole( 'alert', { name: 'Loading required app data' } )
		);
	} );

	describe( 'Set point in time reference url queries and ensure history change', () => {
		test( 'onStart', async () => {
			await validations.onStart();
			referenceUrlQueries.onStart = history.location.search;
		} );

		test( 'onReportingFlowStart', async () => {
			await user.click( screen.getByRole( 'button', { name: 'Go to reporting flow' } ) );

			await validations.onReportingFlowStart();

			referenceUrlQueries.onReportingFlowStart = history.location.search;
			expect( referenceUrlQueries.onReportingFlowStart ).not.toBe( referenceUrlQueries.onStart );
		} );

		test( 'onTypeComplete', async () => {
			await user.click( screen.getByRole( 'radio', { name: 'Feature Request' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			await validations.onTypeComplete();

			referenceUrlQueries.onTypeComplete = history.location.search;
			expect( referenceUrlQueries.onTypeComplete ).not.toBe(
				referenceUrlQueries.onFeatureSelectionComplete
			);
		} );

		test( 'onFeatureSelectionComplete', async () => {
			await user.click( screen.getByRole( 'button', { name: productName } ) );
			await user.click( screen.getByRole( 'option', { name: featureName } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			await validations.onFeatureSelectionComplete();

			referenceUrlQueries.onFeatureSelectionComplete = history.location.search;
			expect( referenceUrlQueries.onFeatureSelectionComplete ).not.toBe(
				referenceUrlQueries.onReportingFlowStart
			);
		} );

		test( 'onFirstTaskComplete', async () => {
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: false } ) );
			await screen.findByRole( 'checkbox', { name: taskName, checked: true } );

			await validations.onFirstTaskComplete();

			referenceUrlQueries.onFirstTaskComplete = history.location.search;
			expect( referenceUrlQueries.onFirstTaskComplete ).not.toBe(
				referenceUrlQueries.onTypeComplete
			);
		} );

		test( 'onFirstTaskUnComplete', async () => {
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: true } ) );

			await validations.onFirstTaskUnComplete();

			referenceUrlQueries.onFirstTaskUnComplete = history.location.search;
			expect( referenceUrlQueries.onFirstTaskUnComplete ).not.toBe(
				referenceUrlQueries.onFirstTaskComplete
			);
		} );

		test( 'onFeatureSelectionEdit', async () => {
			await user.click(
				screen.getByRole( 'button', {
					name: 'Edit',
					description: /Product and Feature/,
				} )
			);

			await validations.onFeatureSelectionEdit();

			referenceUrlQueries.onFeatureSelectionEdit = history.location.search;
			expect( referenceUrlQueries.onFeatureSelectionEdit ).not.toBe(
				referenceUrlQueries.onFirstTaskUnComplete
			);
		} );

		test( 'onTypeEdit', async () => {
			await user.click(
				screen.getByRole( 'button', {
					name: 'Edit',
					description: /Type/,
				} )
			);

			await validations.onTypeEdit();

			referenceUrlQueries.onTypeEdit = history.location.search;
			expect( referenceUrlQueries.onTypeEdit ).not.toBe(
				referenceUrlQueries.onFeatureSelectionEdit
			);
		} );

		test( 'onStartOver', async () => {
			// We have to complete all tasks to get the Start Over button to appear
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: false } ) );
			await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
			await user.click( screen.getByRole( 'menuitem', { name: 'Report a new issue' } ) );

			await validations.onStartOver();

			referenceUrlQueries.onStartOver = history.location.search;
			expect( referenceUrlQueries.onStartOver ).not.toBe( referenceUrlQueries.onTypeEdit );
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
			renderWithProviders( <App />, { apiClient } );
			await waitForElementToBeRemoved(
				screen.queryByRole( 'alert', { name: 'Loading required app data' } )
			);
		}

		for ( const pointInTime of pointsInTime ) {
			test( pointInTime, async () => {
				const urlQuery = referenceUrlQueries[ pointInTime ];

				await setup( urlQuery );
				await validations[ pointInTime ]();
			} );
		}
	} );
} );
