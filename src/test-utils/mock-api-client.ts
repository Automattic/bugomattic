import { ApiClient } from '../api/types';

export function createMockApiClient(): ApiClient {
	return {
		loadReportingConfig: jest.fn( async () => {
			return {};
		} ),
	};
}
