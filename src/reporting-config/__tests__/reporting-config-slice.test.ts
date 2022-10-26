import { normalizeReportingConfig } from '../reporting-config-parsers';
import { ReportingConfigApiResponse } from '../../api';

function createFakeResponse(): ReportingConfigApiResponse {
	return {
		FakeProduct: {
			description: 'Description for fake product',
			learnMoreLinks: [
				{
					type: 'slack',
					channel: 'product-channel',
				},
			],
			taskMapping: {
				bug: [ { instructions: 'Product bug task' } ],
				featureRequest: [ { instructions: 'Product feature request task' } ],
				showStopper: [ { instructions: 'Product show stopper task' } ],
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
					taskMapping: {
						bug: [ { instructions: 'Feature group bug task' } ],
						featureRequest: [ { instructions: 'Feature group request task' } ],
						showStopper: [ { instructions: 'Feature group show stopper task' } ],
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
							taskMapping: {
								bug: [ { instructions: 'Feature nested under group bug task' } ],
								featureRequest: [ { instructions: 'Feature nested under group request task' } ],
								showStopper: [ { instructions: 'Feature nested under group show stopper task' } ],
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
					taskMapping: {
						bug: [ { instructions: 'Feature nested under product bug task' } ],
						featureRequest: [ { instructions: 'Feature nested under product request task' } ],
						showStopper: [ { instructions: 'Feature nested under product show stopper task' } ],
					},
				},
			},
		},
	};
}

describe( '[reportingConfigSlice]', () => {
	describe( 'Normalizing the Reporting Config', () => {
		test( 'Creates the expected normalized reporting config', () => {
			// For this stage of early development, let's use a snapshot to make sure this keeps giving us
			// the respected normalized output. We can add more granular testing later.
			const normalizedReportingConfig = normalizeReportingConfig( createFakeResponse() );
			expect( normalizedReportingConfig ).toMatchSnapshot();
		} );
	} );
} );
