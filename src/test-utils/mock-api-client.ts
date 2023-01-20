export function createMockApiClient() {
	return {
		loadReportingConfig: jest.fn( async () => {
			return {};
		} ),
	};
}
