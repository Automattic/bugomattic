export function createMockApiClient() {
	return {
		loadReportingConfig: jest.fn( async () => {
			return {};
		} ),
		searchIssues: jest.fn( async () => [] ),
		getRepoFilters: jest.fn( async () => [] ),
	};
}
