import { ReportingConfigApiResponse } from '../../api/types';
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
				bug: [ { title: 'Product | bug' } ],
				featureRequest: [ { title: 'Product | feature-request' } ],
				blocker: [ { title: 'Product | blocker' } ],
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
						bug: [ { title: 'Feature group | bug' } ],
						featureRequest: [ { title: 'Feature group | feature request' } ],
						blocker: [ { title: 'Feature group | blocker' } ],
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
									{ title: 'Feature nested under group | bug | index 0' },
									{ title: 'Feature nested under group | bug | index 1' },
								],
								featureRequest: [
									{ title: 'Feature nested under group | feature request | index 0' },
									{ title: 'Feature nested under group | feature request | index 1' },
								],
								blocker: [
									{ title: 'Feature nested under group | blocker | index 0' },
									{ title: 'Feature nested under group | blocker | index 1' },
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
						bug: [ { title: 'Feature nested under product bug task' } ],
						featureRequest: [ { title: 'Feature nested under product feature-request task' } ],
						blocker: [ { title: 'Feature nested under product blocker task' } ],
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
