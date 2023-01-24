/**
 * @jest-environment ./src/test-utils/quit-early-environment.ts
 */

import React from 'react';
import '@testing-library/react/dont-cleanup-after-each';
import {
	Feature,
	FeatureGroup,
	NormalizedReportingConfig,
	Product,
	Task,
} from '../../reporting-config/types';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { ReportingFlow } from '../reporting-flow';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';

/* To test the full flow, we write this test in an E2E testing style.
We render the component once, and then break actions out into individual test steps.
This is still fast though because it's all run in memory with jsdom! */

describe( '[Reporting Flow]', () => {
	const featureA: Feature = {
		id: 'feature_a',
		name: 'Feature A',
		parentType: 'featureGroup',
		parentId: 'feature_group',
		taskMapping: {
			urgent: [],
			featureRequest: [ 'task_a_featureRequest' ],
			bug: [ 'task_a_bug' ],
		},
	};

	const featureB: Feature = {
		id: 'feature_b',
		name: 'Feature B',
		parentType: 'featureGroup',
		parentId: 'feature_group',
		taskMapping: {
			urgent: [],
			featureRequest: [],
			bug: [ 'task_b_bug' ],
		},
	};

	const featureGroup: FeatureGroup = {
		id: 'feature_group',
		name: 'Test Feature Group',
		featureIds: [ 'feature_a', 'feature_b' ],
		productId: 'product',
	};

	const product: Product = {
		id: 'product',
		name: 'Test Product',
		featureGroupIds: [ 'feature_group' ],
		featureIds: [],
	};

	const taskFor_A_featureRequest: Task = {
		id: 'task_a_featureRequest',
		title: 'Task A feature request title',
		parentType: 'feature',
		parentId: 'feature_a',
	};

	const taskFor_A_bug: Task = {
		id: 'task_a_bug',
		title: 'Task A bug title',
		parentType: 'feature',
		parentId: 'feature_a',
	};

	const taskFor_B_bug: Task = {
		id: 'task_b_bug',
		title: 'Task B bug title',
		parentType: 'feature',
		parentId: 'feature_b',
	};

	const reportingConfig: NormalizedReportingConfig = {
		products: {
			[ product.id ]: product,
		},
		featureGroups: {
			[ featureGroup.id ]: featureGroup,
		},
		features: {
			[ featureA.id ]: featureA,
			[ featureB.id ]: featureB,
		},
		tasks: {
			[ taskFor_A_bug.id ]: taskFor_A_bug,
			[ taskFor_A_featureRequest.id ]: taskFor_A_featureRequest,
			[ taskFor_B_bug.id ]: taskFor_B_bug,
		},
	};

	let user: UserEvent;

	// We're using a before all hook because this flow is styled more as an E2E like test run in memory.
	beforeAll( () => {
		const apiClient = createMockApiClient();
		user = userEvent.setup();
		// eslint-disable-next-line testing-library/no-render-in-setup
		renderWithProviders( <ReportingFlow />, {
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
	} );

	const issueTitle = 'Foo Bar Issue Title';

	test( 'The steps are arranged in the correct order', async () => {
		expect(
			screen.getByRole( 'heading', { name: 'Step number 1: Product and Feature' } )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Step number 2: Title and Type' } )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Step number 3: Next Steps' } )
		).toBeInTheDocument();
	} );

	test( 'The flow starts with the feature selection step active', async () => {
		expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();

		// Make sure the content of the other steps is not visible
		expect(
			screen.queryByRole( 'form', { name: 'Set issue title and type' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'list', { name: 'Steps to report issue' } )
		).not.toBeInTheDocument();
	} );

	test( 'Select a feature A and click "Continue"', async () => {
		// Expand tree
		await user.click( screen.getByRole( 'button', { name: product.name, expanded: false } ) );
		await user.click( screen.getByRole( 'button', { name: featureGroup.name, expanded: false } ) );

		// Select feature
		await user.click( screen.getByRole( 'option', { name: featureA.name } ) );

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	test( 'The feature selection step is marked as complete', async () => {
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
		).toBeInTheDocument();
	} );

	test( 'The feature selection step gets an edit button', async () => {
		expect(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Product and Feature/,
			} )
		).toBeInTheDocument();
	} );

	test( 'The feature selection form is replaced with selected feature breadcrumb', async () => {
		expect( screen.queryByRole( 'form', { name: 'Select a feature' } ) ).not.toBeInTheDocument();
		expect(
			screen.getByText( `${ product.name } > ${ featureGroup.name } > ${ featureA.name }` )
		).toBeInTheDocument();
	} );

	test( 'The title and type step is now active', async () => {
		expect( screen.getByRole( 'form', { name: 'Set issue title and type' } ) ).toBeInTheDocument();
	} );

	test( 'Enter issue title, select "Feature Request" type, and click "Continue"', async () => {
		// Set title
		await user.click( screen.getByRole( 'textbox', { name: /Title/ } ) );
		await user.keyboard( issueTitle );

		// Set type
		await user.click( screen.getByRole( 'radio', { name: 'Feature Request' } ) );

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	test( 'The title and type step is marked as complete', async () => {
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Title and Type' } )
		).toBeInTheDocument();
	} );

	test( 'The title and type step gets an edit button', async () => {
		expect(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Title and Type/,
			} )
		).toBeInTheDocument();
	} );

	test( 'The feature selection form is replaced with details about issue title and type', async () => {
		expect(
			screen.queryByRole( 'form', { name: 'Set issue title and type' } )
		).not.toBeInTheDocument();
		expect( screen.getByText( issueTitle ) ).toBeInTheDocument();
		expect( screen.getByText( 'Feature Request' ) ).toBeInTheDocument();
	} );

	test( 'The right list of next step tasks appear for issue details', async () => {
		expect(
			screen.getByRole( 'checkbox', { name: taskFor_A_featureRequest.title, checked: false } )
		).toBeInTheDocument();
	} );

	test( 'Check off the next step task (completing all tasks)', async () => {
		await user.click(
			screen.getByRole( 'checkbox', { name: taskFor_A_featureRequest.title, checked: false } )
		);
	} );

	test( 'The next steps step is marked as complete', async () => {
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Next Steps' } )
		).toBeInTheDocument();
	} );

	test( 'Click the edit button for the title and type step', async () => {
		await user.click(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Title and Type/,
			} )
		);
	} );

	test( 'The title and type step is not marked as complete because it is active', async () => {
		// It reverts to its numerical heading;
		expect(
			screen.getByRole( 'heading', { name: 'Step number 2: Title and Type' } )
		).toBeInTheDocument();
	} );

	test( 'The edit button for title and type step disappears because it is active', async () => {
		// It reverts to its numerical heading;
		expect(
			screen.queryByRole( 'button', {
				name: 'Edit',
				description: /Title and Type/,
			} )
		).not.toBeInTheDocument();
	} );

	test( 'Select a new type: "Bug", but do not continue', async () => {
		await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );
	} );

	test( 'The next step tasks do not update yet for the new type', async () => {
		expect(
			screen.getByRole( 'checkbox', { name: taskFor_A_featureRequest.title } )
		).toBeInTheDocument();

		expect(
			screen.queryByRole( 'checkbox', { name: taskFor_A_bug.title } )
		).not.toBeInTheDocument();
	} );

	test( 'Click "Continue" on the edited title and type step', async () => {
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	test( 'The title and type form returns to its completed state', async () => {
		// Heading
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Title and Type' } )
		).toBeInTheDocument();

		// Edit button
		expect(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Title and Type/,
			} )
		).toBeInTheDocument();

		// No form
		expect(
			screen.queryByRole( 'form', { name: 'Set issue title and type' } )
		).not.toBeInTheDocument();

		// Details
		expect( screen.getByText( 'Bug', { exact: true } ) ).toBeInTheDocument();
	} );

	test( 'The next step tasks update to reflect the new issue type', async () => {
		expect(
			screen.queryByRole( 'checkbox', { name: taskFor_A_featureRequest.title } )
		).not.toBeInTheDocument();

		expect(
			screen.getByRole( 'checkbox', { name: taskFor_A_bug.title, checked: false } )
		).toBeInTheDocument();
	} );

	test( 'Click the edit button for the feature selection step', async () => {
		await user.click(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Product and Feature/,
			} )
		);
	} );

	test( 'The feature selection step is not marked as complete because it is active', async () => {
		// It reverts to its numerical heading;
		expect(
			screen.getByRole( 'heading', { name: 'Step number 1: Product and Feature' } )
		).toBeInTheDocument();
	} );

	test( 'The edit button for the feature selection step disappears because it is active', async () => {
		// It reverts to its numerical heading;
		expect(
			screen.queryByRole( 'button', {
				name: 'Edit',
				description: /Product and Feature/,
			} )
		).not.toBeInTheDocument();
	} );

	test( 'Select a new feature: Feature B', async () => {
		// Expand tree
		await user.click( screen.getByRole( 'button', { name: product.name, expanded: false } ) );
		await user.click( screen.getByRole( 'button', { name: featureGroup.name, expanded: false } ) );

		// Select feature
		await user.click( screen.getByRole( 'option', { name: featureB.name } ) );
	} );

	test( 'The next step tasks do not update yet for the new feature', async () => {
		expect( screen.getByRole( 'checkbox', { name: taskFor_A_bug.title } ) ).toBeInTheDocument();

		expect(
			screen.queryByRole( 'checkbox', { name: taskFor_B_bug.title } )
		).not.toBeInTheDocument();
	} );

	test( 'Click "Continue" on the edited feature selection step', async () => {
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	test( 'The feature selection form returns to its completed state', async () => {
		// Heading
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Product and Feature' } )
		).toBeInTheDocument();

		// Edit button
		expect(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Product and Feature/,
			} )
		).toBeInTheDocument();

		// No form
		expect( screen.queryByRole( 'form', { name: 'Select a feature' } ) ).not.toBeInTheDocument();

		// Details
		expect(
			screen.getByText( `${ product.name } > ${ featureGroup.name } > ${ featureB.name }` )
		).toBeInTheDocument();
	} );

	test( 'The next step tasks update to reflect the new feature', async () => {
		expect(
			screen.queryByRole( 'checkbox', { name: taskFor_A_bug.title } )
		).not.toBeInTheDocument();

		expect(
			screen.getByRole( 'checkbox', { name: taskFor_B_bug.title, checked: false } )
		).toBeInTheDocument();
	} );

	test( 'Does not make the title and type step active because it is already complete', async () => {
		// It's the next step after feature selection, so we automatically go there!
		expect(
			screen.queryByRole( 'form', { name: 'Set issue title and type' } )
		).not.toBeInTheDocument();
	} );
} );
