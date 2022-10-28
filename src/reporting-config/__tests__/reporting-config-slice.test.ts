import { normalizeReportingConfig } from '../reporting-config-parsers';
import { createFakeReportingConfigResponse } from '../../test-utils';

describe( '[reportingConfigSlice]', () => {
	describe( 'Normalizing the Reporting Config', () => {
		test( 'Creates the expected normalized reporting config', () => {
			// For this stage of early development, let's use a snapshot to make sure this keeps giving us
			// the respected normalized output. We can add more granular testing later.
			const fakeResponse = createFakeReportingConfigResponse();
			const normalizedReportingConfig = normalizeReportingConfig( fakeResponse );
			expect( normalizedReportingConfig ).toMatchSnapshot();
		} );
	} );
} );
