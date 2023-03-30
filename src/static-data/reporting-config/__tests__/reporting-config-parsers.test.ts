/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReportingConfigApiResponse } from '../../../api/types';
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
				urgent: [ { title: 'Product | urgent' } ],
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
						urgent: [ { title: 'Feature group | urgent' } ],
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
								urgent: [
									{ title: 'Feature nested under group | urgent | index 0' },
									{ title: 'Feature nested under group | urgent | index 1' },
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
						urgent: [ { title: 'Feature nested under product urgent task' } ],
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

	describe( 'Invalid Reporting Config API responses that should throw errors...', () => {
		const expectedBaseMessage = 'Invalid reporting config:';
		test( 'Invalid root reporting config dictionary ', () => {
			const fakeResponse = 'a string';
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid root reporting config dictionary`
			);
		} );

		test( 'Product that is not a dictionary', () => {
			const fakeResponse = {
				FakeProduct: [ 'an', 'array' ],
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid product "FakeProduct"`
			);
		} );

		test( 'Product that has feature groups that are not a dictionary', () => {
			const fakeResponse = {
				FakeProduct: {
					featureGroups: 1337,
				},
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid feature groups (for product "FakeProduct")`
			);
		} );

		test( 'Feature group that is not a dictionary', () => {
			const fakeResponse = {
				FakeProduct: {
					featureGroups: {
						FakeFeatureGroup: null,
					},
				},
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid feature group "FakeFeatureGroup" (for product "FakeProduct")`
			);
		} );

		test( 'Feature group that has features that are not a dictionary', () => {
			const fakeResponse = {
				FakeProduct: {
					featureGroups: {
						FakeFeatureGroup: {
							features: 'a string',
						},
					},
				},
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid features (for featureGroup "FakeProduct__FakeFeatureGroup")`
			);
		} );

		test( 'Feature that is not a dictionary', () => {
			const fakeResponse = {
				FakeProduct: {
					featureGroups: {
						FakeFeatureGroup: {
							features: {
								FakeFeature: [ 1, 2, 3 ],
							},
						},
					},
				},
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid feature "FakeFeature" (for featureGroup "FakeProduct__FakeFeatureGroup")`
			);
		} );

		test( 'Feature that has tasks that are not a dictionary', () => {
			const fakeResponse = {
				FakeProduct: {
					featureGroups: {
						FakeFeatureGroup: {
							features: {
								FakeFeature: {
									tasks: 'a string',
								},
							},
						},
					},
				},
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid tasks (for feature "FakeProduct__FakeFeatureGroup__FakeFeature")`
			);
		} );

		test( 'Task list that is not an array', () => {
			const fakeResponse = {
				FakeProduct: {
					tasks: {
						bug: { foo: 'bar' },
					},
				},
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid bug tasks (for product "FakeProduct")`
			);
		} );

		test( 'Task that is not a dictionary', () => {
			const fakeResponse = {
				FakeProduct: {
					featureGroups: {
						FakeFeatureGroup: {
							tasks: {
								bug: [ 'an', 'array' ],
							},
							features: {
								FakeFeature: {},
							},
						},
					},
				},
			};
			expect( () => normalizeReportingConfig( fakeResponse as any ) ).toThrowError(
				`${ expectedBaseMessage } Invalid bug task at index 0 (for featureGroup "FakeProduct__FakeFeatureGroup")`
			);
		} );
	} );
} );
