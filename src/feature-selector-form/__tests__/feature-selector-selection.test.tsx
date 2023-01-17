import React, { ReactElement } from 'react';
import {
	Feature,
	FeatureGroup,
	NormalizedReportingConfig,
	Product,
} from '../../reporting-config/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureSelectorForm } from '../feature-selector-form';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

describe( '[FeatureSelector -- Feature Selection]', () => {
	// NOTE! Because we have descriptions here, we will be affected by this bug...
	// https://github.com/eps1lon/dom-accessibility-api/issues/892
	// ... until the fix ends up in react testing library.
	// Therefore, when interacting with options, we will use 'description' -- not 'name'.

	const featureUnderGroup: Feature = {
		id: 'feature_under_group',
		name: 'Test Feature Under Group',
		description: 'Test Feature Under Group Description',
		parentType: 'featureGroup',
		parentId: 'feature_group',
	};

	const featureUnderProduct: Feature = {
		id: 'feature_under_product',
		name: 'Test Feature Under product',
		description: 'Test Feature Under Product Description',
		parentType: 'product',
		parentId: 'product',
	};

	const featureGroup: FeatureGroup = {
		id: 'feature_group',
		name: 'Test Feature Group',
		featureIds: [ 'feature_under_group' ],
		productId: 'product',
	};

	const product: Product = {
		id: 'product',
		name: 'Test Product',
		featureGroupIds: [ 'feature_group' ],
		featureIds: [ 'feature_under_product' ],
	};

	const reportingConfig: NormalizedReportingConfig = {
		tasks: {},
		products: {
			[ product.id ]: product,
		},
		featureGroups: {
			[ featureGroup.id ]: featureGroup,
		},
		features: {
			[ featureUnderProduct.id ]: featureUnderProduct,
			[ featureUnderGroup.id ]: featureUnderGroup,
		},
	};

	function setup( component: ReactElement ) {
		const apiClient = createMockApiClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, {
			apiClient,
			preloadedState: {
				reportingConfig: {
					normalized: reportingConfig,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					indexed: {} as any,
					status: 'loaded',
					error: null,
				},
			},
		} );

		return {
			user,
			...view,
		};
	}

	async function expandAll( user: UserEvent ) {
		await user.click( screen.getByRole( 'button', { expanded: false, name: product.name } ) );
		await user.click( screen.getByRole( 'button', { expanded: false, name: featureGroup.name } ) );
	}

	test( 'Clicking on a feature marks the option as selected', async () => {
		const { user } = setup( <FeatureSelectorForm /> );
		await expandAll( user );

		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);

		expect(
			screen.getByRole( 'option', { selected: true, description: featureUnderGroup.description } )
		).toBeInTheDocument();
	} );

	test( 'Clicking on a new feature unselects the prior option', async () => {
		const { user } = setup( <FeatureSelectorForm /> );
		await expandAll( user );

		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);
		await user.click(
			screen.getByRole( 'option', {
				selected: false,
				description: featureUnderProduct.description,
			} )
		);

		// Old one is unselected
		expect(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		).toBeInTheDocument();
		// New one is selected
		expect(
			screen.getByRole( 'option', { selected: true, description: featureUnderProduct.description } )
		).toBeInTheDocument();
	} );

	test( 'Selecting a feature displays name, description, and breadcrumb for that feature', async () => {
		// We'll test with both features under products and those under groups for completeness.

		const { user } = setup( <FeatureSelectorForm /> );
		await expandAll( user );

		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);

		// Selected feature name
		expect(
			// Multiple text nodes with the name (due to breadcrumb)
			screen.getByText( ( content, element ) => {
				return content === featureUnderGroup.name && element?.className === 'selectedFeatureName';
			} )
		).toBeInTheDocument();
		// Selected feature description
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect( screen.getByText( featureUnderGroup.description! ) ).toBeInTheDocument();
		// Breadcrumb
		expect(
			screen.getByText( ( content ) => {
				// This is kinda gross, but matching the text node of the breadcrumb exactly is a bit wonky -- this is more stable.
				return (
					content.includes( product.name ) &&
					content.includes( featureGroup.name ) &&
					content.includes( featureUnderGroup.name ) &&
					content.indexOf( product.name ) < content.indexOf( featureGroup.name ) &&
					content.indexOf( featureGroup.name ) < content.indexOf( featureUnderGroup.name )
				);
			} )
		);

		await user.click(
			screen.getByRole( 'option', {
				selected: false,
				description: featureUnderProduct.description,
			} )
		);

		// Selected feature name
		expect(
			// Multiple text nodes with the name (due to breadcrumb)
			screen.getByText( ( content, element ) => {
				return content === featureUnderProduct.name && element?.className === 'selectedFeatureName';
			} )
		).toBeInTheDocument();
		// Selected feature description
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		expect( screen.getByText( featureUnderProduct.description! ) ).toBeInTheDocument();
		// Breadcrumb
		expect(
			screen.getByText( ( content ) => {
				// This is kinda gross, but matching the text node of the breadcrumb exactly is a bit wonky -- this is more stable.
				return (
					content.includes( product.name ) &&
					content.includes( featureUnderProduct.name ) &&
					content.indexOf( product.name ) < content.indexOf( featureUnderProduct.name )
				);
			} )
		);
	} );

	test( 'Clicking continue before selecting a feature shows form error', async () => {
		const { user } = setup( <FeatureSelectorForm /> );

		// Isn't there initially
		expect( screen.queryByText( 'You must select a feature' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( screen.getByText( 'You must select a feature' ) ).toBeInTheDocument();
	} );

	test( 'After failed continue, selecting a feature removes form error', async () => {
		const { user } = setup( <FeatureSelectorForm /> );
		await expandAll( user );

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( screen.getByText( 'You must select a feature' ) ).toBeInTheDocument();

		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);

		expect( screen.queryByText( 'You must select a feature' ) ).not.toBeInTheDocument();
	} );

	test( 'Clicking the clear button removes currently selected feature', async () => {
		const { user } = setup( <FeatureSelectorForm /> );
		await expandAll( user );

		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);
		// Make sure our selection went through initially.
		expect(
			screen.getByRole( 'option', { selected: true, description: featureUnderGroup.description } )
		).toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Clear currently selected feature' } ) );
		// Unselects in tree
		expect(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		).toBeInTheDocument();
		// Removes from selected feature panel
		expect(
			screen.queryByText( ( content, element ) => {
				return content === featureUnderProduct.name && element?.className === 'selectedFeatureName';
			} )
		).not.toBeInTheDocument();
	} );
} );
