import { ReportingConfigApiResponse, ApiClient } from '../types';
import localReportingConfigJson from './local-reporting-config-response.json';

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
		await wait( 3000 );
		return localReportingConfigJson as ReportingConfigApiResponse;
	},
};
