/**
 * @jest-environment ./src/test-utils/faux-e2e-environment.ts
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
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

globalThis.scrollTo = jest.fn();

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
	let monitoringClient: ReturnType< typeof createMockMonitoringClient >;

	// We're using a before all hook because this flow is styled more as an E2E like test run in memory.
	beforeAll( () => {
		const apiClient = createMockApiClient();
		monitoringClient = createMockMonitoringClient();
		user = userEvent.setup();
		// eslint-disable-next-line testing-library/no-render-in-setup
		renderWithProviders( <ReportingFlow />, {
			apiClient,
			monitoringClient,
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
			screen.getByRole( 'heading', { name: 'Step number 2: Type and Title' } )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Step number 3: Next Steps' } )
		).toBeInTheDocument();
	} );

	test( 'The flow starts with the feature selection step active', async () => {
		expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();

		// Make sure the content of the other steps is not visible
		expect(
			screen.queryByRole( 'form', { name: 'Set issue type and title' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'list', { name: 'Steps to report issue' } )
		).not.toBeInTheDocument();
	} );

	test( 'Select a feature (Feature A) and click "Continue"', async () => {
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

	test( 'The type and title step is now active', async () => {
		expect( screen.getByRole( 'form', { name: 'Set issue type and title' } ) ).toBeInTheDocument();
	} );

	test( 'Enter issue title, select "Feature Request" type, and click "Continue"', async () => {
		// Set title
		await user.click( screen.getByRole( 'textbox', { name: /Title/ } ) );
		await user.keyboard( issueTitle );

		// Set type
		await user.click( screen.getByRole( 'radio', { name: 'Feature Request' } ) );

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	test( 'The type and title step is marked as complete', async () => {
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Type and Title' } )
		).toBeInTheDocument();
	} );

	test( 'The type and title step gets an edit button', async () => {
		expect(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Type and Title/,
			} )
		).toBeInTheDocument();
	} );

	test( 'The type and title form is replaced with details about issue title and type', async () => {
		expect(
			screen.queryByRole( 'form', { name: 'Set issue type and title' } )
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

	test( 'Confetti appears', async () => {
		expect( await screen.findByTestId( 'confetti' ) ).toBeInTheDocument();
	} );

	test( 'The event "task_complete_all" is recorded', () => {
		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'task_complete_all' );
	} );

	test( 'The next steps step is marked as complete', async () => {
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Next Steps' } )
		).toBeInTheDocument();
	} );

	test( 'Click the edit button for the type and title step', async () => {
		await user.click(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Type and Title/,
			} )
		);
	} );

	test( 'The type and title step is not marked as complete because it is active', async () => {
		// It reverts to its numerical heading;
		expect(
			screen.getByRole( 'heading', { name: 'Step number 2: Type and Title' } )
		).toBeInTheDocument();
	} );

	test( 'The edit button for type and title step disappears because it is active', async () => {
		// It reverts to its numerical heading;
		expect(
			screen.queryByRole( 'button', {
				name: 'Edit',
				description: /Type and Title/,
			} )
		).not.toBeInTheDocument();
	} );

	test( 'The event "type_step_edit" is recorded', () => {
		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'type_step_edit' );
	} );

	test( 'Select a new type: "It\'s Urgent!", but do not continue', async () => {
		await user.click( screen.getByRole( 'radio', { name: "It's Urgent!" } ) );
	} );

	test( 'The next steps step does not update yet for the new type', async () => {
		expect(
			screen.getByRole( 'checkbox', { name: taskFor_A_featureRequest.title } )
		).toBeInTheDocument();
	} );

	test( 'Click "Continue" on the edited type and title step', async () => {
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	test( 'The title and type form returns to its completed state', async () => {
		// Heading
		expect(
			screen.getByRole( 'heading', { name: 'Completed step: Type and Title' } )
		).toBeInTheDocument();

		// Edit button
		expect(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Type and Title/,
			} )
		).toBeInTheDocument();

		// No form
		expect(
			screen.queryByRole( 'form', { name: 'Set issue type and title' } )
		).not.toBeInTheDocument();

		// Details
		expect( screen.getByText( "It's Urgent!", { exact: true } ) ).toBeInTheDocument();
	} );

	test( 'Because there are no tasks configured, the next steps step now has a missing config message', async () => {
		expect(
			screen.getByText(
				'Hmm... It appears this feature area has no issue reporting configuration.',
				{ exact: false }
			)
		).toBeInTheDocument();
	} );

	test( 'Edit the type and title step, change the issue type to "Bug", and continue', async () => {
		await user.click(
			screen.getByRole( 'button', {
				name: 'Edit',
				description: /Type and Title/,
			} )
		);
		await user.click( screen.getByRole( 'radio', { name: 'Bug' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	} );

	test( 'The next steps step now shows new tasks for the new issue type', async () => {
		expect(
			screen.queryByText(
				'Hmm... It appears this feature area has no issue reporting configuration.',
				{ exact: false }
			)
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

	test( 'The event "feature_step_edit" is recorded', () => {
		expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'feature_step_edit' );
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

	test( 'Does not make the type and title step active because it is already complete', async () => {
		// It's the next step after feature selection, so we automatically go there!
		expect(
			screen.queryByRole( 'form', { name: 'Set issue type and title' } )
		).not.toBeInTheDocument();
	} );

	test( 'The Start Over is not visible yet because tasks are not complete', () => {
		expect( screen.queryByRole( 'button', { name: 'Start Over' } ) ).not.toBeInTheDocument();
	} );

	test( 'Complete the new tasks', async () => {
		await user.click(
			screen.getByRole( 'checkbox', { name: taskFor_B_bug.title, checked: false } )
		);
	} );

	test( 'Click the Start Over button, which is now visible', async () => {
		await user.click( screen.getByRole( 'button', { name: 'Start Over' } ) );
	} );

	test( 'Everything resets to its initial state', async () => {
		// First step is expanded
		expect( screen.getByRole( 'form', { name: 'Select a feature' } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'form', { name: 'Set issue title and type' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'list', { name: 'Steps to report issue' } )
		).not.toBeInTheDocument();

		// No feature is selected
		expect(
			screen.queryByRole( 'button', { name: 'Clear currently selected feature' } )
		).not.toBeInTheDocument();

		// No saved type and title visible
		expect( screen.queryByText( 'Feature Request' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( issueTitle ) ).not.toBeInTheDocument();
	} );
} );
