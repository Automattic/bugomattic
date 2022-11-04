import { ReportingConfigApiResponse } from '../../api';
import { normalizeReportingConfig } from '../reporting-config-parsers';

function createFakeReportingConfigResponse(): ReportingConfigApiResponse {
	return {
		FakeProduct: {
			description: 'Description for fake product',
			learnMoreLinks: [
				{
					type: 'slack',
					channel: 'product-channel',
				},
			],
			tasks: {
				bug: [ { instructions: 'Product | bug' } ],
				featureRequest: [ { instructions: 'Product | feature-request' } ],
				blocker: [ { instructions: 'Product | blocker' } ],
			},
			featureGroups: {
				FakeFeatureGroup: {
					description: 'Description for fake feature group',
					learnMoreLinks: [
						{
							type: 'p2',
							subdomain: 'feature-group',
						},
					],
					tasks: {
						bug: [ { instructions: 'Feature group | bug' } ],
						featureRequest: [ { instructions: 'Feature group | feature request' } ],
						blocker: [ { instructions: 'Feature group | blocker' } ],
					},
					features: {
						GroupNestedFeature: {
							description: 'Fake feature nested under feature group',
							keywords: [ 'foo' ],
							learnMoreLinks: [
								{
									type: 'slack',
									channel: 'feature-group-feature',
								},
							],
							tasks: {
								bug: [
									{ instructions: 'Feature nested under group | bug | index 0' },
									{ instructions: 'Feature nested under group | bug | index 1' },
								],
								featureRequest: [
									{ instructions: 'Feature nested under group | feature request | index 0' },
									{ instructions: 'Feature nested under group | feature request | index 1' },
								],
								blocker: [
									{ instructions: 'Feature nested under group | blocker | index 0' },
									{ instructions: 'Feature nested under group | blocker | index 1' },
								],
							},
						},
					},
				},
			},
			features: {
				ProductNestedFeature: {
					description: 'Fake feature nested under product',
					keywords: [ 'bar' ],
					learnMoreLinks: [
						{
							type: 'slack',
							channel: 'product-feature',
						},
					],
					tasks: {
						bug: [ { instructions: 'Feature nested under product bug task' } ],
						featureRequest: [
							{ instructions: 'Feature nested under product feature-request task' },
						],
						blocker: [ { instructions: 'Feature nested under product blocker task' } ],
					},
				},
			},
		},
	};
}

describe( '[reporting-config-parsers]', () => {
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
