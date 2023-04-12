import { ApiClient } from './types';
import path from 'path-browserify';
import { Issue } from '../duplicate-results/types';

/**
 * An implementation of the API client that returns faked values for local development.
 */
export const localApiClient: ApiClient = {
	loadReportingConfig: async () => {
		// Let's keep us honest by adding a little delay here.
		await wait( 2000 );

		const reportingConfigName = path.parse(
			process.env.REACT_APP_REPORTING_CONFIG_NAME || 'default'
		).name;
		const reportingConfigUrl = `${ process.env.PUBLIC_URL }/local-reporting-configs/${ reportingConfigName }.json`;

		try {
			const reportingConfigRepsonse = await fetch( reportingConfigUrl );
			return reportingConfigRepsonse.json();
		} catch ( error ) {
			throw new Error(
				`Unable to find and parse local reporting config called ${ reportingConfigName }.json. ` +
					`Use the env variable "REACT_APP_REPORTING_CONFIG_NAME" and ensure there is a JSON file with a matching name in the "public/local-reporting-configs" directory.` +
					`Original error: ${ error }`
			);
		}
	},

	searchIssues: async ( search, options ) => {
		// Delay to simulate network latency.
		await wait( 2000 );

		// We can tweak this as needed during testing!
		// As a baseline, we'll show all the passed search parameters in the content.
		// And we'll randomize some other stuff so there's good variability.

		const numberOfIssues = Math.floor( Math.random() * 20 );
		const issues: Issue[] = [];
		for ( let i = 0; i < numberOfIssues; i++ ) {
			const randomString = Math.random().toString( 16 ).slice( 2 );
			const title = `Issue ${ randomString }`;

			const providedRepos = ( options?.repos || [ 'none provided' ] ).join( ', ' );
			const providedStatus = options?.status || 'none provided';
			const providedSort = options?.sort || 'none provided';
			const content = `Search: <em data-search-match>${ search }</em>. And another match: <em data-search-match>foo</em>. | Repos: ${ providedRepos } | Status: ${ providedStatus } | Sort: ${ providedSort }`;

			const status = Math.random() > 0.5 ? 'open' : 'closed';

			const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
			const randomDate = new Date(
				Date.now() - Math.floor( Math.random() * oneWeekInMilliseconds )
			).toISOString();

			issues.push( {
				dateCreated: randomDate,
				dateUpdated: randomDate,
				title,
				content,
				status,
				author: 'Fake Author',
				repo: 'Fakeorg/fake-repo',
				url: `https://github.com/Automattic/wp-calypso/issues/${ i }`,
			} );
		}

		return issues;
	},

	loadAvailableRepoFilters: async () => {
		await wait( 1000 );
		return [
			'Automattic/wp-calypso',
			'Automattic/wp-desktop',
			'Automattic/jetpack',
			'Automattic/themes',
			'Automattic/simplenote-ios',
			'Automattic/simplenote-android',
			'Automattic/pocket-casts-ios',
			'Automattic/sensei',
			'Automattic/woocommerce.com',
			'Automattic/newspack-blocks',
			'wordpress-mobile/WordPress-iOS',
			'wordpress-mobile/WordPress-Android',
			'woocommerce/woocommerce',
			'woocommerce/woocommerce-blocks',
			'woocommerce/woocommerce-admin',
			'woocommerce/woocommerce-ios',
			'woocommerce/woocommerce-android',
		];
	},
};

async function wait( ms: number ) {
	return new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );
}
