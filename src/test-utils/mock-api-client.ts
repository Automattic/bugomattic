export function createMockApiClient() {
	return {
		loadReportingConfig: jest.fn( async () => {
			return {};
		} ),
		searchIssues: jest.fn( async () => [] ),
		getAvailableRepoFilters: jest.fn( async () => [] ),
	};
}
