import { ReportingConfigApiResponse } from '../api';

export function createFakeReportingConfigResponse(): ReportingConfigApiResponse {
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
				bug: [ { instructions: 'Product bug task' } ],
				featureRequest: [ { instructions: 'Product feature request task' } ],
				blocker: [ { instructions: 'Product show stopper task' } ],
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
						bug: [ { instructions: 'Feature group bug task' } ],
						featureRequest: [ { instructions: 'Feature group request task' } ],
						blocker: [ { instructions: 'Feature group show stopper task' } ],
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
									{ instructions: 'Feature nested under group bug task index 0' },
									{ instructions: 'Feature nested under group bug task index 1' },
								],
								featureRequest: [
									{ instructions: 'Feature nested under group request task index 0' },
									{ instructions: 'Feature nested under group request task index 1' },
								],
								blocker: [
									{ instructions: 'Feature nested under group show stopper task index 0' },
									{ instructions: 'Feature nested under group show stopper task index 1' },
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
						featureRequest: [ { instructions: 'Feature nested under product request task' } ],
						blocker: [ { instructions: 'Feature nested under product show stopper task' } ],
					},
				},
			},
		},
	};
}
