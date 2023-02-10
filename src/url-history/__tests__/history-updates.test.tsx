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
		'onTitleAndTypeComplete',
		'onFirstTaskComplete',
		'onFirstTaskUnComplete',
		'onFeatureSelectionEdit',
		'onTitleAndTypeEdit',
	] as const;

	type PointInTime = typeof pointsInTime[ number ];

	const validations: { [ key in PointInTime ]: () => void } = {
		onStart: () => {
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

		onFeatureSelectionComplete: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();
			expect( screen.getByText( `${ productName } > ${ featureName }` ) ).toBeInTheDocument();

			expect(
				screen.getByRole( 'form', { name: 'Set issue title and type' } )
			).toBeInTheDocument();
			expect(
				screen.queryByRole( 'list', { name: 'Steps to report issue' } )
			).not.toBeInTheDocument();
		},

		onTitleAndTypeComplete: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Title and Type' } )
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
				screen.getByRole( 'heading', { name: 'Completed step: Title and Type' } )
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
				screen.getByRole( 'heading', { name: 'Completed step: Title and Type' } )
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
				screen.getByRole( 'heading', { name: 'Completed step: Title and Type' } )
			).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},

		onTitleAndTypeEdit: () => {
			expect(
				screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'form', { name: 'Set issue title and type' } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'textbox', { name: /GitHub Issue Title/ } ) ).toHaveValue(
				issueTitle
			);
			expect(
				screen.getByRole( 'radio', { name: 'Feature Request', checked: true } )
			).toBeInTheDocument();

			expect( screen.getByRole( 'list', { name: 'Steps to report issue' } ) ).toBeInTheDocument();
		},
	};

	const referenceUrlQueries: { [ key in PointInTime ]: string } = {
		onStart: 'WILL BE SET IN TEST',
		onFeatureSelectionComplete: 'WILL BE SET IN TEST',
		onTitleAndTypeComplete: 'WILL BE SET IN TEST',
		onFirstTaskComplete: 'WILL BE SET IN TEST',
		onFirstTaskUnComplete: 'WILL BE SET IN TEST',
		onFeatureSelectionEdit: 'WILL BE SET IN TEST',
		onTitleAndTypeEdit: 'WILL BE SET IN TEST',
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

		test( 'onTitleAndTypeComplete', async () => {
			await user.click( screen.getByRole( 'textbox', { name: /GitHub Issue Title/ } ) );
			await user.keyboard( issueTitle );
			await user.click( screen.getByRole( 'radio', { name: 'Feature Request' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			validations.onTitleAndTypeComplete();

			referenceUrlQueries.onTitleAndTypeComplete = history.location.search;
			expect( referenceUrlQueries.onTitleAndTypeComplete ).not.toBe(
				referenceUrlQueries.onFeatureSelectionComplete
			);
		} );

		test( 'onFirstTaskComplete', async () => {
			await user.click( screen.getByRole( 'checkbox', { name: taskName, checked: false } ) );
			await screen.findByRole( 'checkbox', { name: taskName, checked: true } );

			validations.onFirstTaskComplete();

			referenceUrlQueries.onFirstTaskComplete = history.location.search;
			expect( referenceUrlQueries.onFirstTaskComplete ).not.toBe(
				referenceUrlQueries.onTitleAndTypeComplete
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

		test( 'onTitleAndTypeEdit', async () => {
			await user.click(
				screen.getByRole( 'button', {
					name: 'Edit',
					description: /Title and Type/,
				} )
			);

			validations.onTitleAndTypeEdit();

			referenceUrlQueries.onTitleAndTypeEdit = history.location.search;
			expect( referenceUrlQueries.onTitleAndTypeEdit ).not.toBe(
				referenceUrlQueries.onFeatureSelectionEdit
			);
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
