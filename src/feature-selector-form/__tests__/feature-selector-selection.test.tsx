import React, { ReactElement } from 'react';
import {
	Feature,
	FeatureGroup,
	NormalizedReportingConfig,
	Product,
	TaskDetails,
} from '../../static-data/reporting-config/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureSelectorForm } from '../feature-selector-form';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

describe( '[FeatureSelector -- Feature Selection]', () => {
	const featureUnderGroup: Feature = {
		id: 'feature_under_group',
		name: 'Test Feature Under Group',
		description: 'Test Feature Under Group Description',
		parentType: 'featureGroup',
		parentId: 'feature_group',
		keywords: [ 'ABC keyword' ],
		taskMapping: {
			bug: [ 'feature_under_group_task' ],
			featureRequest: [],
			urgent: [],
		},
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

	const githubTask: TaskDetails = {
		title: 'Title',
		details: 'Instructions',
		link: {
			type: 'github',
			repository: 'Automattic/themes',
		},
	};

	const slackTask: TaskDetails = {
		title: 'Duplicate title',
		details: 'Duplicate instructions',
		link: {
			type: 'slack',
			channel: 'fake-channel',
		},
	};

	const reportingConfig: NormalizedReportingConfig = {
		tasks: {
			product_task: {
				id: 'product_task',
				parentType: 'product',
				parentId: product.id,
				...githubTask,
			},
			feature_group_task: {
				id: 'feature_group_task',
				parentType: 'featureGroup',
				parentId: featureGroup.id,
				...slackTask,
			},
			feature_under_product_task: {
				id: 'feature_under_product_task',
				parentType: 'feature',
				parentId: featureUnderProduct.id,
				...githubTask,
			},
			feature_under_group_task: {
				id: 'feature_under_group_task',
				parentType: 'feature',
				parentId: featureUnderGroup.id,
				...githubTask,
			},
		},
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
		const monitoringClient = createMockMonitoringClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, {
			apiClient,
			monitoringClient,
			preloadedState: {
				reportingConfig: {
					normalized: reportingConfig,
					indexed: {},
					loadError: null,
				},
			},
		} );

		return {
			user,
			monitoringClient,
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

	test( 'Selecting a feature displays name, description, repositories, and keywords for that feature', async () => {
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
		expect( screen.getByTestId( 'selected-feature-description' ) ).toHaveTextContent(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			featureUnderGroup.description!
		);

		expect( screen.getByTestId( 'selected-feature-repositories' ) ).toHaveTextContent(
			'Automattic/themes'
		);

		// Keywords
		expect( screen.getByTestId( 'selected-feature-keywords' ) ).toHaveTextContent(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			featureUnderGroup.keywords![ 0 ]
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
		expect( screen.getByTestId( 'selected-feature-description' ) ).toHaveTextContent(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			featureUnderProduct.description!
		);

		// Keywords
		if ( featureUnderProduct.keywords ) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			featureUnderProduct.keywords!.forEach( ( keyword ) => {
				expect( screen.getByTestId( 'selected-feature-keywords' ) ).toHaveTextContent( keyword );
			} );
		} else {
			expect( screen.getByTestId( 'keywords-no-result' ) ).toHaveTextContent( 'None' );
		}
	} );

	test( 'Selecting a feature records the "feature_select" event with feature and product name', async () => {
		const { user, monitoringClient } = setup( <FeatureSelectorForm /> );

		await expandAll( user );
		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);

		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'feature_select', {
			productName: product.name,
			featureName: featureUnderGroup.name,
		} );
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

	test( 'Clicking the clear button records the "feature_clear" event', async () => {
		const { user, monitoringClient } = setup( <FeatureSelectorForm /> );

		await expandAll( user );
		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);
		await user.click( screen.getByRole( 'button', { name: 'Clear currently selected feature' } ) );

		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'feature_clear' );
	} );

	test( 'Clicking continue with a selected feature records the "feature_save" event with feature and product name', async () => {
		const { user, monitoringClient } = setup( <FeatureSelectorForm /> );

		await expandAll( user );
		await user.click(
			screen.getByRole( 'option', { selected: false, description: featureUnderGroup.description } )
		);
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'feature_save', {
			productName: product.name,
			featureName: featureUnderGroup.name,
		} );
	} );
} );
