import React, { ReactElement } from 'react';
import { NormalizedReportingConfig } from '../../reporting-config';
import { createMockApiClient, renderWithProviders } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { FeatureSelector } from '../feature-selector';

describe( '[FeatureSelector -- Tree interaction]', () => {
	/*
	To test searching, we will build a reporting config that has two at each level, and unique parts of each name

	ABC Product
		DEF Group
			GHI Feature
			JKL Feature
		MNO Group
	PQR Product
		STU Feature
		VWX Feature (YZZ Keyword)

	We need no tasks for this set of tests.
	*/
	const reportingConfig: NormalizedReportingConfig = {
		tasks: {},
		products: {
			ABC: {
				id: 'ABC',
				name: 'ABC Product',
				featureGroupIds: [ 'DEF', 'MNO' ],
				featureIds: [],
			},
			PQR: {
				id: 'PQR',
				name: 'PQR Product',
				featureGroupIds: [],
				featureIds: [ 'STU', 'VWX' ],
			},
		},
		featureGroups: {
			DEF: {
				id: 'DEF',
				name: 'DEF Group',
				productId: 'ABC',
				featureIds: [ 'GHI', 'JKL' ],
			},
			MNO: {
				id: 'MNO',
				name: 'MNO Group',
				productId: 'MNO',
				featureIds: [],
			},
		},
		features: {
			GHI: {
				id: 'GHI',
				name: 'GHI Feature',
				parentType: 'featureGroup',
				parentId: 'DEF',
			},
			JKL: {
				id: 'JKL',
				name: 'JKL Feature',
				parentType: 'featureGroup',
				parentId: 'DEF',
			},
			STU: {
				id: 'STU',
				name: 'STU Feature',
				parentType: 'product',
				parentId: 'PQR',
			},
			VWX: {
				id: 'VWX',
				name: 'VWX Feature',
				parentType: 'product',
				parentId: 'PQR',
				keywords: [ 'YZZ Keyword' ],
			},
		},
	};

	async function search( user: ReturnType< typeof userEvent.setup >, searchTerm: string ) {
		await user.click( screen.getByPlaceholderText( 'Search for a feature' ) );
		await user.keyboard( searchTerm );
		// Bypass debouncing by hitting enter
		await user.keyboard( '{Enter}' );
	}

	function setup( component: ReactElement ) {
		const apiClient = createMockApiClient();
		const user = userEvent.setup();
		const renderOutput = renderWithProviders( component, {
			apiClient,
			preloadedState: {
				reportingConfig: {
					normalized: reportingConfig,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					indexed: {} as any,
					status: 'loaded',
					error: null,
					searchTerm: '',
				},
			},
		} );

		return {
			user,
			...renderOutput,
		};
	}

	describe( 'Search matches at different levels', () => {
		test( 'Matching a product filters to that product collapsed', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'abc' );

			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).not.toBeNull();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /Group/ } ) ).toBeNull();
			expect( screen.queryByRole( 'option', { name: /Feature/ } ) ).toBeNull();
		} );

		test( 'Matching a feature group filters to that feature group collapsed and its parent product', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'def' );

			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'DEF Group' } )
			).not.toBeNull();
			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).not.toBeNull();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: 'MNO Group' } ) ).toBeNull();
			expect( screen.queryByRole( 'option', { name: /Feature/ } ) ).toBeNull();
		} );

		test( 'Matching a feature under product filters to that feature and its parent product', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'stu' );

			expect( screen.queryByRole( 'option', { name: 'STU Feature' } ) ).not.toBeNull();
			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).not.toBeNull();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'ABC Product' } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: /Group/ } ) ).toBeNull();
			expect( screen.queryByRole( 'option', { name: 'VWX Feature' } ) ).toBeNull();
		} );

		test( 'Matching a feature under group filters to that feature and both parent levels', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'jkl' );

			expect( screen.queryByRole( 'option', { name: 'JKL Feature' } ) ).not.toBeNull();
			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'DEF Group' } )
			).not.toBeNull();
			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).not.toBeNull();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).toBeNull();
			expect( screen.queryByRole( 'button', { name: 'MNO Group' } ) ).toBeNull();
			expect( screen.queryByRole( 'option', { name: 'GHI Feature' } ) ).toBeNull();
		} );

		test( 'Matching a feature keyword is same as matching feature, but adds keyword to name', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'yzz' );

			// There's a weird bug somewhere in the virtual DOM or React Testing Library that is adding a space
			// around the accessible name for the keyword match result. This doesn't reproduce in an actual browser.
			// We work around by checking out the text node.
			expect( screen.getByRole( 'option', { name: /VWX Feature/ } ) ).toHaveTextContent(
				'VWX Feature (YZZ Keyword)'
			);
			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).not.toBeNull();
		} );

		test( 'If no matches are found, shows a message', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'asdfhjklajvhxc ygaisudsudyfiuasd' );

			expect(
				screen.queryByText( 'No results found. Try a different search or explore manually below.' )
			).not.toBeNull();
		} );

		test( 'If no matches are found, shows the initial tree state of all products collapsed', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'asdfhjklajvhxc ygaisudsudyfiuasd' );

			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).not.toBeNull();
			expect(
				screen.queryByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).not.toBeNull();
		} );
	} );

	describe( 'Other search result behavior', () => {
		test( 'Search result matches highlight the search term', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'ghi' );

			const highlightedMatches = screen.getAllByTestId( 'highlighted-substring' );
			expect( highlightedMatches.length ).toBe( 1 );
			expect( highlightedMatches[ 0 ]?.textContent ).toBe( 'GHI' );
		} );

		test( 'You can expand result parents to see other non-matches', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'ghi' );
			await user.click( screen.getByRole( 'button', { expanded: false, name: 'DEF Group' } ) );

			expect(
				screen.queryByRole( 'button', { expanded: true, name: 'DEF Group' } )
			).not.toBeNull();
			expect( screen.queryByRole( 'option', { name: 'GHI Feature' } ) ).not.toBeNull();
			expect( screen.queryByRole( 'option', { name: 'JKL Feature' } ) ).not.toBeNull();
		} );

		test( 'Recollapsing an expanded parent will always only show search matches', async () => {
			const { user } = setup( <FeatureSelector /> );
			await search( user, 'ghi' );
			await user.click( screen.getByRole( 'button', { expanded: false, name: 'DEF Group' } ) );
			await user.click( screen.getByRole( 'button', { expanded: true, name: 'DEF Group' } ) );

			expect( screen.queryByRole( 'option', { name: 'GHI Feature' } ) ).not.toBeNull();
			expect( screen.queryByRole( 'option', { name: 'JKL Feature' } ) ).toBeNull();
		} );
	} );
} );
