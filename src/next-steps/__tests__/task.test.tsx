import userEvent from '@testing-library/user-event';
import React, { ReactElement } from 'react';
import { NormalizedReportingConfig, Task } from '../../static-data/reporting-config/types';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { Task as TaskComponent } from '../sub-components/task';
import { screen, fireEvent } from '@testing-library/react';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

describe( '[Task]', () => {
	function setup( component: ReactElement, task: Task ) {
		const apiClient = createMockApiClient();
		const monitoringClient = createMockMonitoringClient();
		const user = userEvent.setup();
		const reportingConfig: NormalizedReportingConfig = {
			products: {},
			featureGroups: {},
			features: {},
			tasks: {
				[ task.id ]: task,
			},
		};
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
	describe( 'Task content', () => {
		test( 'Includes the task title and details for non-link tasks', () => {
			const title = 'Foo';
			const details = 'bar baz';
			const task: Task = {
				id: 'non-link',
				parentId: 'foo',
				parentType: 'product',
				title: title,
				details: details,
			};

			setup( <TaskComponent taskId={ task.id } />, task );

			expect( screen.getByText( title ) ).toBeInTheDocument();
			expect( screen.getByText( details ) ).toBeInTheDocument();
		} );

		test( 'Includes the task title and details for link tasks', () => {
			const title = 'Foo';
			const details = 'bar baz';
			const task: Task = {
				id: 'link',
				parentId: 'foo',
				parentType: 'product',
				title: title,
				details: details,
				link: {
					type: 'general',
					href: 'https://automattic.com/',
				},
			};

			setup( <TaskComponent taskId={ task.id } />, task );

			expect(
				screen.getByRole( 'link', { name: title, description: details } )
			).toBeInTheDocument();
		} );

		test( 'A task with no title, link, or details is not displayed', () => {
			const task: Task = {
				id: 'id',
				parentId: 'foo',
				parentType: 'product',
			};

			setup( <TaskComponent taskId={ task.id } />, task );

			expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		} );

		test( 'A task with a broken configuration shows error message and no link', () => {
			// easiest way is an invalid p2 subdomain
			const task: Task = {
				id: 'p2',
				parentId: 'foo',
				parentType: 'product',
				link: {
					type: 'p2',
					subdomain: 'automattic.com',
				},
			};

			setup( <TaskComponent taskId={ task.id } />, task );

			expect( screen.getByText( 'Bad link configuration' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					"Uh oh! We've logged an error and will follow up. In the meantime, you can try contacting the product team directly."
				)
			).toBeInTheDocument();
			expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		} );

		describe( 'Creates correct links for task types:', () => {
			test( 'Github link task', () => {
				const title = 'GitHub task';
				const task: Task = {
					id: 'github',
					parentId: 'foo',
					parentType: 'product',
					title: title,
					link: {
						type: 'github',
						repository: 'Automattic/bugomattic',
					},
				};

				setup( <TaskComponent taskId={ task.id } />, task );

				const link = screen.getByRole( 'link', { name: title } );
				expect( link ).toBeInTheDocument();
				const expectedHref = 'https://github.com/Automattic/bugomattic/issues/new/choose';
				expect( link ).toHaveAttribute( 'href', expectedHref );
				expect( screen.getByTestId( 'github-icon' ) ).toBeInTheDocument();
			} );

			test( 'Slack link task', () => {
				const title = 'Slack task';
				const channel = 'foo';
				const task: Task = {
					id: 'slack',
					parentId: 'foo',
					parentType: 'product',
					title: title,
					link: {
						type: 'slack',
						channel: channel,
					},
				};
				setup( <TaskComponent taskId={ task.id } />, task );

				const link = screen.getByRole( 'link', { name: title } );
				expect( link ).toBeInTheDocument();
				const expectedHref = `https://slack.com/app_redirect?channel=${ channel }`;
				expect( link ).toHaveAttribute( 'href', expectedHref );
				expect( screen.getByTestId( 'slack-icon' ) ).toBeInTheDocument();
			} );

			test( 'P2 link task', () => {
				const title = 'P2 task';
				const subdomain = 'foo';
				const task: Task = {
					id: 'p2',
					parentId: 'foo',
					parentType: 'product',
					title: title,
					link: {
						type: 'p2',
						subdomain: subdomain,
					},
				};
				setup( <TaskComponent taskId={ task.id } />, task );

				const link = screen.getByRole( 'link', { name: title } );
				expect( link ).toBeInTheDocument();
				const expectedHref = `https://${ subdomain }.wordpress.com/`;
				expect( link ).toHaveAttribute( 'href', expectedHref );
				expect( screen.getByTestId( 'p2-icon' ) ).toBeInTheDocument();
			} );

			test( 'General link task', () => {
				const title = 'General link task';
				const href = 'https://automattic.com/';
				const task: Task = {
					id: 'general',
					parentId: 'foo',
					parentType: 'product',
					title: title,
					link: {
						type: 'general',
						href: href,
					},
				};
				setup( <TaskComponent taskId={ task.id } />, task );

				const link = screen.getByRole( 'link', { name: title } );
				expect( link ).toBeInTheDocument();
				expect( link ).toHaveAttribute( 'href', href );
			} );
		} );

		describe( 'Creates correct default titles and details for task types:', () => {
			test( 'GitHub link task', () => {
				const repo = 'Automattic/bugomattic';
				const task: Task = {
					id: 'github',
					parentId: 'foo',
					parentType: 'product',
					link: {
						type: 'github',
						repository: repo,
					},
				};
				setup( <TaskComponent taskId={ task.id } />, task );

				expect(
					screen.getByRole( 'link', {
						name: `Click to open your report in the ${ repo } repo`,
						description:
							'Don\'t forget to click "Submit new issue" on the GitHub form when you\'re done!',
					} )
				).toBeInTheDocument();
			} );

			test( 'Slack link task', () => {
				const channel = 'foo';
				const task: Task = {
					id: 'slack',
					parentId: 'foo',
					parentType: 'product',
					link: {
						type: 'slack',
						channel: channel,
					},
				};

				setup( <TaskComponent taskId={ task.id } />, task );

				expect(
					screen.getByRole( 'link', { name: `Notify the #${ channel } channel in Slack` } )
				).toBeInTheDocument();
			} );

			test( 'P2 link task', () => {
				const subdomain = 'foo';
				const task: Task = {
					id: 'p2',
					parentId: 'foo',
					parentType: 'product',
					link: {
						type: 'p2',
						subdomain: subdomain,
					},
				};

				setup( <TaskComponent taskId={ task.id } />, task );

				expect(
					screen.getByRole( 'link', { name: `Post on the +${ subdomain } P2` } )
				).toBeInTheDocument();
			} );

			test( 'General link task', () => {
				const href = 'https://automattic.com/';
				const task: Task = {
					id: 'general',
					parentId: 'foo',
					parentType: 'product',
					link: {
						type: 'general',
						href: href,
					},
				};

				setup( <TaskComponent taskId={ task.id } />, task );
				expect(
					screen.getByRole( 'link', { name: 'Click to report your issue' } )
				).toBeInTheDocument();
			} );

			test( 'Jira link task', () => {
				const task: Task = {
					id: 'jira',
					parentId: 'foo',
					parentType: 'product',
					link: {
						type: 'jira',
						hostName: 'fake.atlasssian.net',
						projectId: 12345,
						issueTypeId: 54321,
					},
				};

				setup( <TaskComponent taskId={ task.id } />, task );
				expect(
					screen.getByRole( 'link', { name: 'Click to open a new Jira issue' } )
				).toBeInTheDocument();
			} );

			test( 'Task with no link and no title', () => {
				const task: Task = {
					id: 'general',
					parentId: 'foo',
					parentType: 'product',
					details: 'details',
				};

				setup( <TaskComponent taskId={ task.id } />, task );

				expect( screen.getByText( 'Complete the details below' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Task interaction', () => {
		test( 'Clicking "Mark as complete" marks the step as complete, changing the UI', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'basic',
				parentId: 'foo',
				parentType: 'product',
				title: title,
				link: {
					type: 'general',
					href: 'https://automattic.com',
				},
			};

			const { user } = setup( <TaskComponent taskId={ task.id } />, task );

			await user.click(
				screen.getByRole( 'button', { name: 'Mark as complete', description: title } )
			);

			// Button changes
			expect(
				screen.getByRole( 'button', {
					name: 'Unmark as complete',
					description: `Completed step: ${ title }`,
				} )
			).toBeInTheDocument();

			// We append "Completed step" to the title for screen readers
			expect(
				screen.getByRole( 'link', { name: `Completed step: ${ title }` } )
			).toBeInTheDocument();

			// We append this data attribute to drive styling -- closest proxy for testing the style changes.
			expect( screen.getByRole( 'listitem' ) ).toHaveAttribute( 'data-completed-task', 'true' );

			// Icon changes
			expect( screen.getByTestId( 'check-icon' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'general-icon' ) ).not.toBeInTheDocument();
		} );

		test( 'Completing a task records the "task_complete" event', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'basic',
				parentId: 'foo',
				parentType: 'product',
				title: title,
			};

			const { user, monitoringClient } = setup( <TaskComponent taskId={ task.id } />, task );

			await user.click( screen.getByRole( 'button', { name: 'Mark as complete' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'task_complete' );
		} );

		test( 'Clicking "unmark as complete" unmarks the task as complete, resetting the UI', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'basic',
				parentId: 'foo',
				parentType: 'product',
				title: title,
				link: {
					type: 'general',
					href: 'https://automattic.com',
				},
			};

			const { user } = setup( <TaskComponent taskId={ task.id } />, task );

			await user.click( screen.getByRole( 'button', { name: 'Mark as complete' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Unmark as complete' } ) );

			// Button is back to starting UI
			expect(
				screen.getByRole( 'button', {
					name: 'Mark as complete',
					description: `${ title }`,
				} )
			).toBeInTheDocument();

			// "Completed step" is removed from the title for screen readers
			expect( screen.getByRole( 'link', { name: title } ) ).toBeInTheDocument();

			// The data attribute is set back to "false", resetting the styles
			expect( screen.getByRole( 'listitem' ) ).toHaveAttribute( 'data-completed-task', 'false' );

			// Icon changes back to task icon
			expect( screen.getByTestId( 'general-icon' ) ).toBeInTheDocument();
			expect( screen.queryByTestId( 'check-icon' ) ).not.toBeInTheDocument();
		} );

		test( 'Clicking on a link in a task completes the task', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'general link',
				parentId: 'foo',
				parentType: 'product',
				title: title,
				link: {
					type: 'general',
					href: 'https://automattic.com/',
				},
			};
			setup( <TaskComponent taskId={ task.id } />, task );

			// The userEvent action doesn't play well with links, so using fireEvent.
			fireEvent.click( screen.getByRole( 'link', { name: title } ) );

			// Use button as proxy for checking completion
			expect( screen.getByRole( 'button', { name: 'Unmark as complete' } ) ).toBeInTheDocument();
		} );

		test( 'Clicking on a link when the task is complete leaves it as complete', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'general link',
				parentId: 'foo',
				parentType: 'product',
				title: title,
				link: {
					type: 'general',
					href: 'https://automattic.com/',
				},
			};
			const { user } = setup( <TaskComponent taskId={ task.id } />, task );

			await user.click( screen.getByRole( 'button', { name: 'Mark as complete' } ) );
			fireEvent.click( screen.getByRole( 'link', { name: `Completed step: ${ title }` } ) );

			// Still complete
			expect( screen.getByRole( 'button', { name: 'Unmark as complete' } ) ).toBeInTheDocument();
		} );

		test( 'Click on a link in a task records both the "task_complete" and "task_link_click" events', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'general link',
				parentId: 'foo',
				parentType: 'product',
				title: title,
				link: {
					type: 'general',
					href: 'https://automattic.com/',
				},
			};
			const { monitoringClient } = setup( <TaskComponent taskId={ task.id } />, task );

			// The userEvent action doesn't play well with links, so using fireEvent.
			fireEvent.click( screen.getByRole( 'link', { name: title } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'task_complete' );
			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'task_link_click', {
				linkType: 'general',
			} );
		} );
	} );
} );
