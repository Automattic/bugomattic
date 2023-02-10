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
	const featureName = 'Feature';
	const taskName = 'Task Title';
	const issueTitle = 'Sample Issue Title';
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
							{
								title: 'Other task to avoid confetti',
							},
						],
						urgent: [],
					},
				},
			},
		},
	};

	const pointsInTime = [
		'onStart',
		'onFeatureSelectionComplete',
		'onTypeTitleComplete',
		'onFirstTaskComplete',
		'onFirstTaskUnComplete',
		'onFeatureSelectionEdit',
		'onTypeTitleEdit',
		'onStartOver',
	] as const;

	type PointInTime = typeof pointsInTime[ number ];

	const validations: { [ key in PointInTime ]: () => void } = {
		onStart: () => {
			expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: 'Clear currently selected feature' } )
			).not.toBeInTheDocument();

			expect(
				screen.queryByRole( 'form', { name: 'Set issue type and title' } )
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'list', { name: 'Steps to report issue' } )
			).not.toBeInTheDocument();
		},

		onFeatureSelectionComplete: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();
			expect( screen.getByText( `${ productName } > ${ featureName }` ) ).toBeInTheDocument();

			expect(
				screen.getByRole( 'form', { name: 'Set issue type and title' } )
			).toBeInTheDocument();
			expect(
				screen.queryByRole( 'list', { name: 'Steps to report issue' } )
			).not.toBeInTheDocument();
		},

		onTypeTitleComplete: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Type and Title' } )
			).toBeInTheDocument();
			expect( screen.getByText( issueTitle ) ).toBeInTheDocument();
			expect( screen.getByText( 'Feature Request' ) ).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},

		onFirstTaskComplete: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Type and Title' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'checkbox', { name: taskName, checked: true } )
			).toBeInTheDocument();
		},

		onFirstTaskUnComplete: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Type and Title' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'checkbox', { name: taskName, checked: false } )
			).toBeInTheDocument();
		},

		onFeatureSelectionEdit: () => {
			expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { name: 'Clear currently selected feature' } )
			).toBeInTheDocument(); // The current feature should still be selected

			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Type and Title' } )
			).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},

		onTypeTitleEdit: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'form', { name: 'Set issue type and title' } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'textbox', { name: /Title \(Optional\)/ } ) ).toHaveValue(
				issueTitle
			);
			expect(
				screen.getByRole( 'radio', { name: 'Feature Request', checked: true } )
			).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},

		onStartOver: () => {
			expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: 'Clear currently selected feature' } )
			).not.toBeInTheDocument();

			expect(
				screen.queryByRole( 'form', { name: 'Set issue title and type' } )
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'list', { name: 'Steps to report issue' } )
			).not.toBeInTheDocument();
		},
	};

	const referenceUrlQueries: { [ key in PointInTime ]: string } = {
		onStart: 'WILL BE SET IN TEST',
		onFeatureSelectionComplete: 'WILL BE SET IN TEST',
		onTypeTitleComplete: 'WILL BE SET IN TEST',
		onFirstTaskComplete: 'WILL BE SET IN TEST',
		onFirstTaskUnComplete: 'WILL BE SET IN TEST',
		onFeatureSelectionEdit: 'WILL BE SET IN TEST',
		onTypeTitleEdit: 'WILL BE SET IN TEST',
		onStartOver: 'WILL BE SET IN TEST',
	};

	let user: UserEvent;
	beforeAll( () => {
		const apiClient = createMockApiClient();
		user = userEvent.setup();
		apiClient.loadReportingConfig = jest.fn().mockResolvedValue( fakeReportingConfigApiResponse );
		// eslint-disable-next-line testing-library/no-render-in-setup
		renderWithProviders( <App />, { apiClient } );
	} );

	describe( 'Set point in time reference url queries and ensure history change', () => {
		test( 'onStart', () => {
			validations.onStart();
			referenceUrlQueries.onStart = history.location.search;
		} );

		test( 'onFeatureSelectionComplete', async () => {
			await user.click( screen.getByRole( 'button', { name: 'Product' } ) );
			await user.click( screen.getByRole( 'option', { name: 'Feature' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			validations.onFeatureSelectionComplete();

			referenceUrlQueries.onFeatureSelectionComplete = history.location.search;
			expect( referenceUrlQueries.onFeatureSelectionComplete ).not.toBe(
				referenceUrlQueries.onStart
			);
		} );

		test( 'onTypeTitleComplete', async () => {
			await user.click( screen.getByRole( 'textbox', { name: /Title \(Optional\)/ } ) );
			await user.keyboard( issueTitle );
			await user.click( screen.getByRole( 'radio', { name: 'Feature Request' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			validations.onTypeTitleComplete();

			referenceUrlQueries.onTypeTitleComplete = history.location.search;
			expect( referenceUrlQueries.onTypeTitleComplete ).not.toBe(
				referenceUrlQueries.onFeatureSelectionComplete
			);
		} );

		test( 'onFirstTaskComplete', async () => {
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: false } ) );
			await screen.findByRole( 'checkbox', { name: taskName, checked: true } );

			validations.onFirstTaskComplete();

			referenceUrlQueries.onFirstTaskComplete = history.location.search;
			expect( referenceUrlQueries.onFirstTaskComplete ).not.toBe(
				referenceUrlQueries.onTypeTitleComplete
			);
		} );

		test( 'onFirstTaskUnComplete', async () => {
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: true } ) );

			validations.onFirstTaskUnComplete();

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

			validations.onFeatureSelectionEdit();

			referenceUrlQueries.onFeatureSelectionEdit = history.location.search;
			expect( referenceUrlQueries.onFeatureSelectionEdit ).not.toBe(
				referenceUrlQueries.onFirstTaskUnComplete
			);
		} );

		test( 'onTypeTitleEdit', async () => {
			await user.click(
				screen.getByRole( 'button', {
					name: 'Edit',
					description: /Type and Title/,
				} )
			);

			validations.onTypeTitleEdit();

			referenceUrlQueries.onTypeTitleEdit = history.location.search;
			expect( referenceUrlQueries.onTypeTitleEdit ).not.toBe(
				referenceUrlQueries.onFeatureSelectionEdit
			);
		} );

		test( 'onStartOver', async () => {
			await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );

			validations.onStartOver();

			referenceUrlQueries.onStartOver = history.location.search;
			expect( referenceUrlQueries.onStartOver ).not.toBe( referenceUrlQueries.onTypeTitleEdit );
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
				screen.queryByRole( 'alert', { name: 'Loading issue reporting configuration' } )
			);
		}

		for ( const pointInTime of pointsInTime ) {
			test( pointInTime, async () => {
				const urlQuery = referenceUrlQueries[ pointInTime ];

				await setup( urlQuery );
				validations[ pointInTime ]();
			} );
		}
	} );
} );
