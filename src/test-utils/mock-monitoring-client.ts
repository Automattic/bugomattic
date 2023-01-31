export function createMockMonitoringClient() {
	return {
		logger: {
			debug: jest.fn(),
			info: jest.fn(),
			error: jest.fn(),
		},
		analytics: {
			recordEvent: jest.fn(),
		},
	};
}
