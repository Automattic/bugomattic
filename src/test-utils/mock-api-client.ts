import { AvailableRepoFiltersApiResponse, SearchIssueApiResponse } from '../api/types';

export function createMockApiClient() {
	return {
		loadReportingConfig: jest.fn( async () => {
			return {};
		} ),
		searchIssues: jest.fn( async () => [] as SearchIssueApiResponse ),
		loadAvailableRepoFilters: jest.fn( async () => [] as AvailableRepoFiltersApiResponse ),
	};
}
