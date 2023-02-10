import React, { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { TitleTypeForm } from '../title-type-form';
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

	function getTitleInput() {
		return screen.getByRole( 'textbox', { name: /GitHub Issue Title/ } );
	}

	describe( '[Title Input]', () => {
		test( 'Can add text to the Title input', async () => {
			const { user } = setup( <TitleTypeForm /> );
			const text = 'This is my sample title text';
			await user.click( getTitleInput() );
			await user.keyboard( text );

			expect( getTitleInput() ).toHaveValue( text );
		} );

		test( 'When empty, see message of max of 200 characters remaining', async () => {
			setup( <TitleTypeForm /> );
			const expectedText = 'Maximum 200 characters';
			expect( screen.getByText( expectedText, { exact: true } ) ).toBeInTheDocument();
		} );

		test( 'When typing a title, see message with remaining characters allowed', async () => {
			const { user } = setup( <TitleTypeForm /> );
			const text = 'This is my sample title text';
			await user.click( getTitleInput() );
			await user.keyboard( text );

			const expectedText = `Maximum 200 characters (${ 200 - text.length } remaining)`;
			expect( screen.getByText( expectedText ) ).toBeInTheDocument();
		} );

		test( 'When you go over the limit, see message with number of characters over in warning style', async () => {
			const { user } = setup( <TitleTypeForm /> );
			const text = 'a'.repeat( 201 );
			await user.click( getTitleInput() );
			await user.keyboard( text );

			const expectedOverLimitText = `${ text.length - 200 } over`;

			const expectedText = `Maximum 200 characters (${ expectedOverLimitText })`;
			// Need a custom matcher because the text is split by a span
			expect(
				screen.getByText( ( _content, element ) => {
					// The svgs trip up this check for some reason, so need to check for SVG first.
					if ( element?.nodeName === 'svg' || ! element?.className.includes( 'limitMessage' ) ) {
						return false;
					}
					return element.textContent === expectedText;
				} )
			).toBeInTheDocument();

			expect( screen.getByText( expectedOverLimitText, { exact: true } ) ).toHaveClass(
				'limitWarning'
			);
		} );

		test( 'When you go over the limit, adds aria-invalid and invalid class to the input', async () => {
			const { user } = setup( <TitleTypeForm /> );
			const text = 'a'.repeat( 201 );
			await user.click( getTitleInput() );
			await user.keyboard( text );

			expect( getTitleInput() ).toBeInvalid();
			expect( getTitleInput() ).toHaveClass( 'invalidInput' );
		} );

		test( 'If over the limit, see form field error message when you blur the input', async () => {
			const { user } = setup( <TitleTypeForm /> );
			const text = 'a'.repeat( 201 );
			await user.click( getTitleInput() );
			await user.keyboard( text );

			const expectedText = 'Title must be under the character limit';

			// Doesn't show immediately
			expect( screen.queryByText( expectedText ) ).not.toBeInTheDocument();

			// Click on a radio to blur the input field
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );

			expect( await screen.findByText( expectedText ) ).toBeInTheDocument();
		} );

		test( 'Once you go back under the limit, the form error goes away', async () => {
			const { user } = setup( <TitleTypeForm /> );
			const text = 'a'.repeat( 201 );
			await user.click( getTitleInput() );
			await user.keyboard( text );

			const expectedText = 'Title must be under the character limit';

			// Click on a radio to blur the input field
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );
			await user.clear( screen.getByRole( 'textbox', { name: /Title/ } ) );

			expect( screen.queryByText( expectedText ) ).not.toBeInTheDocument();
		} );
	} );

	describe( '[Type Radios]', () => {
		test( 'Can select all three issue types', async () => {
			const { user } = setup( <TitleTypeForm /> );

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
			const { user } = setup( <TitleTypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			const expectedText = 'You must pick an issue type';

			expect( await screen.findByText( expectedText ) ).toBeInTheDocument();
		} );

		test( 'Clicking "Continue" with an unselected issue type marks the radios as invalid', async () => {
			const { user } = setup( <TitleTypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( screen.getByRole( 'radio', { name: 'Bug' } ) ).toBeInvalid();
			expect( screen.getByRole( 'radio', { name: 'Feature Request' } ) ).toBeInvalid();
			expect( screen.getByRole( 'radio', { name: "It's Urgent!" } ) ).toBeInvalid();
		} );

		test( 'Selecting an issue type causes the form field error to disappear', async () => {
			const { user } = setup( <TitleTypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );

			const expectedText = 'You must pick an issue type';

			expect( screen.queryByText( expectedText ) ).not.toBeInTheDocument();
		} );

		test( 'Selecting an issue type causes radios to no longer be invalid', async () => {
			const { user } = setup( <TitleTypeForm /> );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );

			expect( screen.getByRole( 'radio', { name: 'Bug' } ) ).not.toBeInvalid();
			expect( screen.getByRole( 'radio', { name: 'Feature Request' } ) ).not.toBeInvalid();
			expect( screen.getByRole( 'radio', { name: "It's Urgent!" } ) ).not.toBeInvalid();
		} );
	} );

	describe( '[Analytics]', () => {
		test( 'Clicking continue with only a type records the "type_save" event, but not the "title_save" event', async () => {
			const { user, monitoringClient } = setup( <TitleTypeForm /> );
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'type_save', {
				issueType: 'bug',
			} );
			expect( monitoringClient.analytics.recordEvent ).not.toHaveBeenCalledWith( 'title_save' );
		} );

		test( 'Clicking continue with a type and title records both events', async () => {
			const { user, monitoringClient } = setup( <TitleTypeForm /> );
			await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );
			await user.click( getTitleInput() );
			await user.keyboard( 'This is a title' );
			await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'type_save', {
				issueType: 'bug',
			} );
			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'title_save' );
		} );
	} );
} );
