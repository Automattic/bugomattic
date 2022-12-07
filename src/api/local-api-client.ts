import { ApiClient } from './types';
import path from 'path-browserify';

/**
 * An implementation of the API client that returns faked values for local development.
 */
export const localApiClient: ApiClient = {
	loadReportingConfig: async () => {
		const wait = ( ms: number ) =>
			new Promise( ( resolve ) => {
				setTimeout( resolve, ms );
			} );

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
};
