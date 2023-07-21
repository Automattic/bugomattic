import React, { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { TypeForm } from '../type-form';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

describe( '[TitleTypeForm]', () => {
	function setup( component: ReactElement ) {
		const monitoringClient = createMockMonitoringClient();
		const apiClient = createMockApiClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, { apiClient, monitoringClient } );

		return {
			user,
			monitoringClient,
			...view,
		};
	}

	describe( '[Type Radios]', () => {
		test( 'Can select all three issue types', async () => {
			const { user } = setup( <TypeForm /> );

			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );
			expect( screen.getByRole( 'radio', { name: 'Bug', checked: true } ) ).toBeInTheDocument();

			await user.click( screen.getByRole( 'radio', { name: 'Feature Request' } ) );
			expect(
				screen.getByRole( 'radio', { name: 'Feature Request', checked: true } )
			).toBeInTheDocument();

			await user.click( screen.getByRole( 'radio', { name: "It's Urgent!" } ) );
			expect(
				screen.getByRole( 'radio', { name: "It's Urgent!", checked: true } )
			).toBeInTheDocument();
		} );

		test( 'Clicking "Continue" with an unselected issue type causes a form field error to appear', async () => {
			const { user } = setup( <TypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			const expectedText = 'You must pick an issue type';

			expect( await screen.findByText( expectedText ) ).toBeInTheDocument();
		} );

		test( 'Clicking "Continue" with an unselected issue type marks the radios as invalid', async () => {
			const { user } = setup( <TypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( screen.getByRole( 'radio', { name: 'Bug' } ) ).toBeInvalid();
			expect( screen.getByRole( 'radio', { name: 'Feature Request' } ) ).toBeInvalid();
			expect( screen.getByRole( 'radio', { name: "It's Urgent!" } ) ).toBeInvalid();
		} );

		test( 'Selecting an issue type causes the form field error to disappear', async () => {
			const { user } = setup( <TypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );

			const expectedText = 'You must pick an issue type';

			expect( screen.queryByText( expectedText ) ).not.toBeInTheDocument();
		} );

		test( 'Selecting an issue type causes radios to no longer be invalid', async () => {
			const { user } = setup( <TypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );

			expect( screen.getByRole( 'radio', { name: 'Bug' } ) ).not.toBeInvalid();
			expect( screen.getByRole( 'radio', { name: 'Feature Request' } ) ).not.toBeInvalid();
			expect( screen.getByRole( 'radio', { name: "It's Urgent!" } ) ).not.toBeInvalid();
		} );
	} );

	describe( '[Analytics]', () => {
		test( 'Clicking continue with a type records event', async () => {
			const { user, monitoringClient } = setup( <TypeForm /> );
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'type_save', {
				issue_type: 'bug',
			} );
		} );
	} );
} );
