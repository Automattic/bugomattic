import { ApiClient } from './types';

/**
 * Placeholder for the "real" API client for making real HTTP calls to the backend REST API.
 * This will ultimately become a more complicated class that handles auth, etc.
 */
export const productionApiClient: ApiClient = {
	loadReportingConfig: async () => {
		throw new Error( 'Not implemented!' );
	},
};
