import {
	createGeneralHref,
	createNewGithubIssueHref,
	createNewJiraIssueHref,
	createNewLinearIssueHref,
	createP2Href,
	createSlackHref,
} from '../links';

describe( '[Links]', () => {
	describe( '[createGeneralHref]', () => {
		test( 'Returns a full URL just as it is', () => {
			const url = 'https://automattic.com/';
			expect(
				createGeneralHref( {
					type: 'general',
					href: url,
				} )
			).toBe( url );
		} );

		test( 'Throws an error if the URL is invalid', () => {
			const url = 'foo';
			expect( () =>
				createGeneralHref( {
					type: 'general',
					href: url,
				} )
			).toThrowError();
		} );
	} );

	describe( '[createSlackHref]', () => {
		test( 'Creates correct href with encoded channel param', () => {
			const channel = 'channel&name';
			const expectedHref = 'https://slack.com/app_redirect?channel=channel%26name';
			expect(
				createSlackHref( {
					type: 'slack',
					channel: channel,
				} )
			).toBe( expectedHref );
		} );

		test( 'Strips the leading # sign if provided', () => {
			const channel = '#channel-name';
			const expectedHref = 'https://slack.com/app_redirect?channel=channel-name';
			expect(
				createSlackHref( {
					type: 'slack',
					channel: channel,
				} )
			).toBe( expectedHref );
		} );
	} );

	describe( '[createP2Href]', () => {
		test( 'Creates correct wordpress.com href', () => {
			const subdomain = 'foo';
			const expectedHref = 'https://foo.wordpress.com/';
			expect(
				createP2Href( {
					type: 'p2',
					subdomain: subdomain,
				} )
			).toBe( expectedHref );
		} );

		test( 'Strips a leading + sign if provided', () => {
			const subdomain = '+foo';
			const expectedHref = 'https://foo.wordpress.com/';
			expect(
				createP2Href( {
					type: 'p2',
					subdomain: subdomain,
				} )
			).toBe( expectedHref );
		} );

		test( 'Throws error if an invalid subdomain is provided', () => {
			const subdomain = 'foo.com';
			expect( () =>
				createP2Href( {
					type: 'p2',
					subdomain: subdomain,
				} )
			).toThrowError( new Error( `Recieved an invalid p2 subdomain: ${ subdomain }.` ) );
		} );
	} );

	describe( '[createNewGithubIssueHref]', () => {
		test( 'Correctly creates href and encodes all the provided GitHub params', () => {
			const expectedHref =
				'https://github.com/Automattic/bugomattic/issues/new?template=foo%26bar&projects=Automattic%2F1%2CTest%2F2&labels=%5BPri%5D+High%2Ctest-label';
			expect(
				createNewGithubIssueHref( {
					type: 'github',
					repository: 'Automattic/bugomattic',
					template: 'foo&bar',
					labels: [ '[Pri] High', 'test-label' ],
					projectSlugs: [ 'Automattic/1', 'Test/2' ],
				} )
			).toBe( expectedHref );
		} );

		test( 'If an org is provided, uses it to customize the URL', () => {
			const expectedHref = 'https://github.a8c.com/Automattic/wpcom/issues/new/choose';
			expect(
				createNewGithubIssueHref( {
					type: 'github',
					repository: 'Automattic/wpcom',
					org: 'a8c',
				} )
			).toBe( expectedHref );
		} );

		test( 'If no org is provided, uses the default GitHub URL', () => {
			const expectedHref = 'https://github.com/Automattic/bugomattic/issues/new/choose';
			expect(
				createNewGithubIssueHref( {
					type: 'github',
					repository: 'Automattic/bugomattic',
				} )
			).toBe( expectedHref );
		} );

		test( 'If no GitHub params are provided, ends route at /new/choose', () => {
			const expectedHref = 'https://github.com/Automattic/bugomattic/issues/new/choose';
			expect(
				createNewGithubIssueHref( {
					type: 'github',
					repository: 'Automattic/bugomattic',
				} )
			).toBe( expectedHref );
		} );

		test( 'If an issue title is provided, adds and encodes query param for it', () => {
			const expectedHref =
				'https://github.com/Automattic/bugomattic/issues/new/choose?title=foo%26bar';
			expect(
				createNewGithubIssueHref(
					{
						type: 'github',
						repository: 'Automattic/bugomattic',
					},
					'foo&bar'
				)
			).toBe( expectedHref );
		} );
	} );

	describe( '[createNewJiraIssueHref]', () => {
		test( 'Correctly creates href and encodes all the provided Jira params', () => {
			const expectedHref =
				'https://jira.tumblr.net/secure/CreateIssueDetails!init.jspa?pid=12345&issuetype=1';
			expect(
				createNewJiraIssueHref( {
					type: 'jira',
					hostName: 'jira.tumblr.net',
					projectId: 12345,
					issueTypeId: 1,
				} )
			).toBe( expectedHref );
		} );

		test( 'Strips https:// if provided', () => {
			const expectedHref =
				'https://jira.tumblr.net/secure/CreateIssueDetails!init.jspa?pid=12345&issuetype=1';
			expect(
				createNewJiraIssueHref( {
					type: 'jira',
					hostName: 'https://jira.tumblr.net',
					projectId: 12345,
					issueTypeId: 1,
				} )
			).toBe( expectedHref );
		} );
	} );

	describe( '[createNewLinearIssueHref]', () => {
		test( 'Correctly creates href when no workspace is provided', () => {
			const expectedHref = 'https://linear.app/new';
			expect(
				createNewLinearIssueHref( {
					type: 'linear',
				} )
			).toBe( expectedHref );
		} );
		test( 'Correctly creates href when a workspace is provided', () => {
			const expectedHref = 'https://linear.app/workspace/new';
			expect(
				createNewLinearIssueHref( {
					type: 'linear',
					workspace: 'workspace',
				} )
			).toBe( expectedHref );
		} );
		test( 'Correctly creates href when no team is provided', () => {
			const expectedHref = 'https://linear.app/new';
			expect(
				createNewLinearIssueHref( {
					type: 'linear',
				} )
			).toBe( expectedHref );
		} );

		test( 'Correctly creates href when a team is provided', () => {
			const expectedHref = 'https://linear.app/team/calypso/new';
			expect(
				createNewLinearIssueHref( {
					type: 'linear',
					team: 'calypso',
				} )
			).toBe( expectedHref );
		} );

		test( 'Correctly creates href when a workspace and team are provided', () => {
			const expectedHref = 'https://linear.app/workspace/team/calypso/new';
			expect(
				createNewLinearIssueHref( { type: 'linear', workspace: 'workspace', team: 'calypso' } )
			).toBe( expectedHref );
		} );

		test( 'When both a team and a project are provided, the URL points to the project', () => {
			const expectedHref = 'https://linear.app/workspace/project/123/new';
			expect(
				createNewLinearIssueHref( {
					type: 'linear',
					workspace: 'workspace',
					team: 'calypso',
					project: '123',
				} )
			).toBe( expectedHref );
		} );

		test( 'When only a project is provided, without a team, it is not added to the URL', () => {
			const expectedHref = 'https://linear.app/workspace/new';
			expect(
				createNewLinearIssueHref( { type: 'linear', workspace: 'workspace', project: '123' } )
			).toBe( expectedHref );
		} );

		test( 'If an issue title is provided, adds and encodes query param for it', () => {
			const expectedHref = 'https://linear.app/new?title=foo%26bar';
			expect( createNewLinearIssueHref( { type: 'linear' }, 'foo&bar' ) ).toBe( expectedHref );
		} );

		test( 'Correctly creates href and encodes all the provided GitHub params', () => {
			const expectedHref =
				'https://linear.app/team/calypso/new?title=foo%26bar&status=bar&priority=high&template=baz&labels=foo%2Cbar';
			expect(
				createNewLinearIssueHref(
					{
						type: 'linear',
						team: 'calypso',
						status: 'bar',
						priority: 'high',
						labels: [ 'foo', 'bar' ],
						template: 'baz',
					},
					'foo&bar'
				)
			).toBe( expectedHref );
		} );
	} );
} );
