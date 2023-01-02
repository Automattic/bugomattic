import React, { ReactElement } from 'react';
import { NormalizedReportingConfig } from '../../reporting-config';
import { createMockApiClient, renderWithProviders } from '../../test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureSelectorForm } from '../feature-selector-form';

describe( '[FeatureSelector -- Tree interaction]', () => {
	/*
	To test expanding and sorting all with one simple reporting config, we build one like...

	A Product
		A Feature Group
			A Feature
			B Feature
		B Feature Group
		A Feature Under Product
		B Feature Under Product
	B Product

	... with all the ids intentionally not sorted alphabetically.

	We need no tasks for this set of tests.

	Note -- there is a bug in the underlying library code where "option" roles that have "title"
	attributes are miscalculating the accessible name. Because of that, we are avoiding adding descriptions here.
	See https://github.com/eps1lon/dom-accessibility-api/issues/892.
	*/
	const reportingConfig: NormalizedReportingConfig = {
		tasks: {},
		products: {
			product_a: {
				id: 'product_a',
				name: 'A Product',
				featureGroupIds: [ 'feature_group_b', 'feature_group_a' ],
				featureIds: [ 'feature_under_product_b', 'feature_under_product_a' ],
			},
			product_b: {
				id: 'product_b',
				name: 'B Product',
				featureGroupIds: [],
				featureIds: [],
			},
		},
		featureGroups: {
			feature_group_a: {
				id: 'feature_group_a',
				name: 'A Feature Group',
				productId: 'product_a',
				featureIds: [ 'feature_b', 'feature_a' ],
			},
			feature_group_b: {
				id: 'feature_group_b',
				name: 'B Feature Group',
				productId: 'product_a',
				featureIds: [],
			},
		},
		features: {
			feature_under_product_a: {
				id: 'feature_under_product_a',
				name: 'A Feature Under Product',
				parentType: 'product',
				parentId: 'product_a',
			},
			feature_under_product_b: {
				id: 'feature_under_product_b',
				name: 'B Feature Under Product',
				parentType: 'product',
				parentId: 'product_a',
			},
			feature_a: {
				id: 'feature_a',
				name: 'A Feature',
				parentType: 'featureGroup',
				parentId: 'feature_group_a',
			},
			feature_b: {
				id: 'feature_b',
				name: 'B Feature',
				parentType: 'featureGroup',
				parentId: 'feature_group_a',
			},
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

	describe( 'Tree navigation and expansion/collapsing', () => {
		test( 'Initially only the collapsed products are visible', () => {
			setup( <FeatureSelectorForm /> );

			expect(
				screen.getByRole( 'button', {
					expanded: false,
					name: 'A Product',
				} )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'button', {
					expanded: false,
					name: 'B Product',
				} )
			).toBeInTheDocument();

			expect( screen.queryByRole( 'button', { name: /Feature Group/ } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: /Feature/ } ) ).not.toBeInTheDocument();
		} );

		test( 'Clicking on a collapsed product toggles it as expanded', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			expect(
				screen.getByRole( 'button', { expanded: true, name: 'A Product' } )
			).toBeInTheDocument();
		} );

		test( 'Expanding a collapsed product shows correct nested feature groups and features', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );

			// Correct feature groups are all visible
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'B Feature Group' } )
			).toBeInTheDocument();

			// Correct features under product are all visible
			expect(
				screen.getByRole( 'option', { name: 'A Feature Under Product' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'option', { name: 'B Feature Under Product' } )
			).toBeInTheDocument();

			// Features under feature groups are NOT visible
			expect( screen.queryByRole( 'option', { name: 'A Feature' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'B Feature' } ) ).not.toBeInTheDocument();
		} );

		test( 'Clicking on an expanded product toggles it as collapsed', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click( screen.getByRole( 'button', { expanded: true, name: 'A Product' } ) );

			expect(
				screen.getByRole( 'button', { expanded: false, name: 'A Product' } )
			).toBeInTheDocument();
		} );

		test( 'Collapsing an expanded product hides all records underneath it', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			// Let's check those features under the feature groups too! We expand them initially.
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);

			await user.click( screen.getByRole( 'button', { expanded: true, name: 'A Product' } ) );

			expect( screen.queryByRole( 'button', { name: /Feature Group/ } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: /Feature/ } ) ).not.toBeInTheDocument();
		} );

		test( 'Clicking a collapsed feature group toggles it as expanded', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);

			expect(
				screen.getByRole( 'button', { expanded: true, name: 'A Feature Group' } )
			).toBeInTheDocument();
		} );

		test( 'Expanding a collapsed feature group shows correct nested features', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);

			expect( screen.getByRole( 'option', { name: 'A Feature' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'B Feature' } ) ).toBeInTheDocument();
		} );

		test( 'Clicking an expanded feature group toggles it as collapsed', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);
			await user.click( screen.getByRole( 'button', { expanded: true, name: 'A Feature Group' } ) );

			expect(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			).toBeInTheDocument();
		} );

		test( 'Collapsing an expanded feature group hides the features underneath it', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);
			await user.click( screen.getByRole( 'button', { expanded: true, name: 'A Feature Group' } ) );

			expect( screen.queryByRole( 'option', { name: 'A Feature' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'B Feature' } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Feature selecting', () => {
		test( 'Clicking on a feature marks it as selected', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			// First, expand to make sure the features are visible
			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);

			await user.click( screen.getByRole( 'option', { selected: false, name: 'A Feature' } ) );

			expect(
				screen.getByRole( 'option', { selected: true, name: 'A Feature' } )
			).toBeInTheDocument();
		} );

		test( 'Clicking on a new feature unselects the old one', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			// First, expand to make sure the features are visible
			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);

			await user.click( screen.getByRole( 'option', { selected: false, name: 'A Feature' } ) );
			await user.click(
				screen.getByRole( 'option', { selected: false, name: 'B Feature Under Product' } )
			);

			// New one is selected
			expect(
				screen.getByRole( 'option', { selected: true, name: 'B Feature Under Product' } )
			).toBeInTheDocument();
			// Old one is unselected
			expect(
				screen.getByRole( 'option', { selected: false, name: 'A Feature' } )
			).toBeInTheDocument();
		} );
	} );

	describe( 'Sorting', () => {
		test( 'The products are sorted alphabetically', () => {
			setup( <FeatureSelectorForm /> );

			const [ firstProduct, secondProduct ] = screen.getAllByRole( 'button', {
				name: /Product/,
			} );

			expect( firstProduct ).toHaveTextContent( 'A Product' );
			expect( secondProduct ).toHaveTextContent( 'B Product' );
		} );

		test( 'The feature groups under a product are sorted alphabetically', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );

			const [ firstFeatureGroup, secondFeatureGroup ] = screen.getAllByRole( 'button', {
				name: /Feature Group/,
			} );

			expect( firstFeatureGroup ).toHaveTextContent( 'A Feature Group' );
			expect( secondFeatureGroup ).toHaveTextContent( 'B Feature Group' );
		} );

		test( 'The features under a product are sorted alphabetically', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );

			const [ firstFeatureUnderProduct, secondFeatureUnderProduct ] = screen.getAllByRole(
				'option',
				{
					name: /Feature Under Product/,
				}
			);

			expect( firstFeatureUnderProduct ).toHaveTextContent( 'A Feature Under Product' );
			expect( secondFeatureUnderProduct ).toHaveTextContent( 'B Feature Under Product' );
		} );

		test( 'The features under a feature group are sorted alphabetically', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await user.click( screen.getByRole( 'button', { expanded: false, name: 'A Product' } ) );
			await user.click(
				screen.getByRole( 'button', { expanded: false, name: 'A Feature Group' } )
			);

			const [ firstFeature, secondFeature ] = screen.getAllByRole( 'option', {
				name: /[AB] Feature$/,
			} );

			expect( firstFeature ).toHaveTextContent( 'A Feature' );
			expect( secondFeature ).toHaveTextContent( 'B Feature' );
		} );
	} );
} );
