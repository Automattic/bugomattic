import React, { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { NormalizedReportingConfig } from '../../static-data/reporting-config/types';
import { renderWithProviders } from '../../test-utils/render-with-providers';
import { MoreInfo } from '../more-info';
import { fireEvent, screen } from '@testing-library/react';
import { createMockMonitoringClient } from '../../test-utils/mock-monitoring-client';

describe( '[MoreInfo]', () => {
	function setup(
		component: ReactElement,
		featureId: string,
		reportingConfig: NormalizedReportingConfig
	) {
		const apiClient = createMockApiClient();
		const monitoringClient = createMockMonitoringClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, {
			apiClient,
			monitoringClient,
			preloadedState: {
				reportingConfig: {
					normalized: reportingConfig,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					indexed: {} as any,
					loadStatus: 'loaded',
					loadError: null,
				},
				issueDetails: {
					issueType: 'bug',
					featureId: featureId,
					issueTitle: '',
				},
			},
		} );

		return {
			user,
			monitoringClient,
			...view,
		};
	}

	describe( 'Entity availability', () => {
		function createStartingReportingConfig() {
			const featureId = 'featureId';
			// Use a mixture of description and link settings to help cover supporting both
			const reportingConfig: NormalizedReportingConfig = {
				products: {
					productId: {
						id: 'productId',
						name: 'Product',
						description: 'Product description',
						featureIds: [],
						featureGroupIds: [ 'featureGroupId' ],
					},
				},
				featureGroups: {
					featureGroupId: {
						id: 'featureGroupId',
						name: 'Feature Group',
						learnMoreLinks: [
							{
								type: 'slack',
								channel: 'channelName',
							},
						],
						featureIds: [ featureId ],
						productId: 'productId',
					},
				},
				features: {
					[ featureId ]: {
						id: featureId,
						name: 'Feature',
						description: 'Feature description',
						learnMoreLinks: [ { type: 'p2', subdomain: 'p2subdomain' } ],
						parentType: 'featureGroup',
						parentId: 'featureGroupId',
					},
				},
				tasks: {},
			};

			return {
				featureId,
				reportingConfig,
			};
		}

		it( 'If the feature has no description or links, it is excluded', async () => {
			const { featureId, reportingConfig } = createStartingReportingConfig();
			delete reportingConfig.features[ featureId ].description;
			delete reportingConfig.features[ featureId ].learnMoreLinks;

			setup( <MoreInfo />, featureId, reportingConfig );

			// Other sections are still present
			expect( screen.getByRole( 'heading', { name: 'Product', exact: true } ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'heading', { name: 'Feature Group', exact: true } )
			).toBeInTheDocument();

			// Feature info is not
			expect(
				screen.queryByRole( 'heading', { name: 'Feature', exact: true } )
			).not.toBeInTheDocument();
		} );

		it( 'If the feature group has no description or links, it is excluded', async () => {
			const { featureId, reportingConfig } = createStartingReportingConfig();
			delete reportingConfig.featureGroups[ 'featureGroupId' ].description;
			// Mix it up with an empty array of learn more links
			reportingConfig.featureGroups[ 'featureGroupId' ].learnMoreLinks = [];

			setup( <MoreInfo />, featureId, reportingConfig );

			// Other sections are still present
			expect( screen.getByRole( 'heading', { name: 'Product', exact: true } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Feature', exact: true } ) ).toBeInTheDocument();

			// Feature group info is not
			expect(
				screen.queryByRole( 'heading', { name: 'Feature Group', exact: true } )
			).not.toBeInTheDocument();
		} );

		it( 'If the feature is directly under a product, no feature group info is included', async () => {
			const { featureId, reportingConfig } = createStartingReportingConfig();
			// We're cheesing this a bit for simplicity. We should really update both directions, but this is
			// the only one that matters here, and keeps the test quite a bit more simple.
			reportingConfig.features[ featureId ].parentType = 'product';
			reportingConfig.features[ featureId ].parentId = 'productId';

			setup( <MoreInfo />, featureId, reportingConfig );

			// Other sections are still present
			expect( screen.getByRole( 'heading', { name: 'Product', exact: true } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Feature', exact: true } ) ).toBeInTheDocument();

			// Feature group info is not
			expect(
				screen.queryByRole( 'heading', { name: 'Feature Group', exact: true } )
			).not.toBeInTheDocument();
		} );

		it( 'If the product has no description or links, it is excluded', async () => {
			const { featureId, reportingConfig } = createStartingReportingConfig();
			delete reportingConfig.products[ 'productId' ].description;
			delete reportingConfig.products[ 'productId' ].learnMoreLinks;

			setup( <MoreInfo />, featureId, reportingConfig );

			// Other sections are still present
			expect(
				screen.getByRole( 'heading', { name: 'Feature Group', exact: true } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Feature', exact: true } ) ).toBeInTheDocument();

			// Feature group info is not
			expect(
				screen.queryByRole( 'heading', { name: 'Product', exact: true } )
			).not.toBeInTheDocument();
		} );

		it( 'If no entities have any descriptions or links, the whole section does not display', async () => {
			const { featureId, reportingConfig } = createStartingReportingConfig();
			delete reportingConfig.products[ 'productId' ].description;
			delete reportingConfig.products[ 'productId' ].learnMoreLinks;
			delete reportingConfig.featureGroups[ 'featureGroupId' ].description;
			delete reportingConfig.featureGroups[ 'featureGroupId' ].learnMoreLinks;
			delete reportingConfig.features[ featureId ].description;
			delete reportingConfig.features[ featureId ].learnMoreLinks;

			setup( <MoreInfo />, featureId, reportingConfig );

			expect(
				screen.queryByRole( 'heading', { name: 'More Information', exact: true } )
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'heading', { name: 'Product', exact: true } )
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'heading', { name: 'Feature Group', exact: true } )
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'heading', { name: 'Feature', exact: true } )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'Content display', () => {
		const featureId = 'featureId';
		const description = 'feature description unique text';
		const reportingConfig: NormalizedReportingConfig = {
			products: {
				productId: {
					id: 'productId',
					name: 'Product',
					featureIds: [ featureId ],
					featureGroupIds: [],
				},
			},
			featureGroups: {},
			features: {
				[ featureId ]: {
					id: featureId,
					name: 'Feature',
					description: description,
					learnMoreLinks: [
						{ type: 'p2', subdomain: 'p2subdomain' },
						{ type: 'p2', subdomain: 'p2subdomainwithtext', displayText: 'P2 display text' },
						{ type: 'slack', channel: 'slack-channel' },
						{
							type: 'slack',
							channel: 'slack-channel-with-text',
							displayText: 'Slack display text',
						},
						{ type: 'general', href: 'https://automattic.com' },
						{ type: 'general', href: 'https://google.com', displayText: 'General display text' },
					],
					parentType: 'product',
					parentId: 'productId',
				},
			},
			tasks: {},
		};

		test( 'By default, P2 links have a display text of "+subdomain"', async () => {
			setup( <MoreInfo />, featureId, reportingConfig );

			expect( screen.getByRole( 'link', { name: '+p2subdomain' } ) ).toBeInTheDocument();
		} );

		test( 'By default, Slack links have a display text of "#channel"', async () => {
			setup( <MoreInfo />, featureId, reportingConfig );

			expect( screen.getByRole( 'link', { name: '#slack-channel' } ) ).toBeInTheDocument();
		} );

		test( 'By default, General links have a display text of "#channel"', async () => {
			setup( <MoreInfo />, featureId, reportingConfig );

			expect( screen.getByRole( 'link', { name: 'https://automattic.com' } ) ).toBeInTheDocument();
		} );

		test( 'All links support adding display text', async () => {
			setup( <MoreInfo />, featureId, reportingConfig );

			expect( screen.getByRole( 'link', { name: 'P2 display text' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Slack display text' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'General display text' } ) ).toBeInTheDocument();
		} );

		test( 'If the entity has a description, it is displayed', async () => {
			setup( <MoreInfo />, featureId, reportingConfig );

			expect( screen.getByText( description ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Content interaction', () => {
		const featureId = 'featureId';
		const reportingConfig: NormalizedReportingConfig = {
			products: {
				productId: {
					id: 'productId',
					name: 'Product',
					featureIds: [ featureId ],
					featureGroupIds: [],
				},
			},
			featureGroups: {},
			features: {
				[ featureId ]: {
					id: featureId,
					name: 'Feature',
					learnMoreLinks: [
						{ type: 'general', href: 'https://automattic.com', displayText: 'Link Display' },
					],
					parentType: 'product',
					parentId: 'productId',
				},
			},
			tasks: {},
		};

		test( 'Click on a link records the "more_info_link_click" event with link type', () => {
			const { monitoringClient } = setup( <MoreInfo />, featureId, reportingConfig );

			fireEvent.click( screen.getByRole( 'link', { name: 'Link Display' } ) );

			expect( monitoringClient.analytics.recordEvent ).toHaveBeenCalledWith(
				'more_info_link_click',
				{ linkType: 'general' }
			);
		} );
	} );
} );
