import {
	AvailableRepoFiltersApiResponse,
	SearchIssueApiResponse,
	SearchIssueOptions,
} from '../api/types';

export function createMockApiClient() {
	return {
		loadReportingConfig: jest.fn( async () => {
			return {};
		} ),
		searchIssues: jest.fn(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			async ( _search: string, _options?: SearchIssueOptions ) => [] as SearchIssueApiResponse
		),
		loadAvailableRepoFilters: jest.fn( async () => [] as AvailableRepoFiltersApiResponse ),
	};
}
