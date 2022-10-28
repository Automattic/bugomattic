import { ApiClient } from '../api';
import { createFakeReportingConfigResponse } from './fake-reporting-config-reponse';

export function createMockApiClient(): ApiClient {
	return {
		loadReportingConfig: jest.fn( async () => createFakeReportingConfigResponse() ),
	};
}
