import { templateSettings } from 'lodash';
import {
	createGeneralHref,
	createNewGithubIssueHref,
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
} );
