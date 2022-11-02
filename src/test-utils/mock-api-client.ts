import { ApiClient } from '../api';

export function createMockApiClient(): ApiClient {
	return {
		loadReportingConfig: jest.fn( async () => {
			return {};
		} ),
	};
}
