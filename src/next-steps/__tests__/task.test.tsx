import userEvent from '@testing-library/user-event';
import React, { ReactElement } from 'react';
import { NormalizedReportingConfig, Task } from '../../reporting-config/types';
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
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					indexed: {} as any,
					status: 'loaded',
					error: null,
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

			expect(
				screen.getByRole( 'checkbox', { name: `${ title } ${ details }` } )
			).toBeInTheDocument();
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
				screen.getByRole( 'checkbox', { name: `${ title } ${ details }` } )
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

		test( 'A task with a broken configuration shows error title and no details or link', () => {
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

			expect(
				screen.getByRole( 'checkbox', {
					name: 'This task has broken configuration. Please notify the Bugomattic administrators.',
				} )
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

		describe( 'Creates correct default titles for task types:', () => {
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
					screen.getByRole( 'checkbox', { name: `Open an issue in the ${ repo } repo` } )
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
					screen.getByRole( 'checkbox', { name: `Notify the #${ channel } channel in Slack` } )
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
					screen.getByRole( 'checkbox', { name: `Post on the +${ subdomain } P2` } )
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

				expect( screen.getByRole( 'checkbox', { name: href } ) ).toBeInTheDocument();
			} );

			test( 'Task with no link and no title', () => {
				const task: Task = {
					id: 'general',
					parentId: 'foo',
					parentType: 'product',
					details: 'details',
				};

				setup( <TaskComponent taskId={ task.id } />, task );

				expect(
					screen.getByRole( 'checkbox', { name: /Complete the details below/ } )
				).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Task interaction', () => {
		test( 'Clicking on a unchecked task checks the checkbox', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'basic',
				parentId: 'foo',
				parentType: 'product',
				title: title,
			};

			const { user } = setup( <TaskComponent taskId={ task.id } />, task );

			await user.click( screen.getByRole( 'checkbox', { name: title, checked: false } ) );

			expect( screen.getByRole( 'checkbox', { name: title, checked: true } ) ).toBeInTheDocument();
		} );

		test( 'Checking a task records the "task_complete" event', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'basic',
				parentId: 'foo',
				parentType: 'product',
				title: title,
			};

			const { user, monitoringClient } = setup( <TaskComponent taskId={ task.id } />, task );

			await user.click( screen.getByRole( 'checkbox', { name: title, checked: false } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith( 'task_complete' );
		} );

		test( 'Clicking on a checked task unchecks the checkbox', async () => {
			const title = 'Foo task';
			const task: Task = {
				id: 'basic',
				parentId: 'foo',
				parentType: 'product',
				title: title,
			};

			const { user } = setup( <TaskComponent taskId={ task.id } />, task );

			await user.click( screen.getByRole( 'checkbox', { name: title, checked: false } ) );
			await user.click( screen.getByRole( 'checkbox', { name: title, checked: true } ) );

			expect( screen.getByRole( 'checkbox', { name: title, checked: false } ) ).toBeInTheDocument();
		} );

		test( 'Clicking on a link in a task checks the checkbox too', async () => {
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

			expect(
				await screen.findByRole( 'checkbox', { name: title, checked: true } )
			).toBeInTheDocument();
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
