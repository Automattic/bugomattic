import { ApiClient } from './types';

/**
 * Placeholder for the "real" API client for making real HTTP calls to the backend REST API.
 * This will ultimately become a more complicated class that handles auth, etc.
 */
export const productionApiClient: ApiClient = {
	loadReportingConfig: async () => {
		const nonce = globalThis.nonce;
		const nonceHeaderName = globalThis.nonceHeaderName;

		const request = new Request( '/wp-json/bugomattic/v1/reporting-config/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: new Headers( {
				[ nonceHeaderName ]: nonce,
			} ),
		} );
		const response = await fetch( request );

		if ( response.ok ) {
			return response.json();
		} else {
			throw new Error(
				`Load Reporting Config web request failed with status code ${
					response.status
				}. Response body: ${ await response.json() }`
			);
		}
	},
};
