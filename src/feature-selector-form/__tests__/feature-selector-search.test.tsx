import React, { ReactElement } from 'react';
import {
	NormalizedReportingConfig,
	IndexedReportingConfig,
} from '../../static-data/reporting-config/types';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { FeatureSelectorForm } from '../feature-selector-form';
import { createMockApiClient } from '../../test-utils/mock-api-client';
import { renderWithProviders } from '../../test-utils/render-with-providers';

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
				description: 'The stats tools showing traffic and engagement.',
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
				description: 'The paid site backup package.',
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
				description: 'Blocks that come from the Newspack plugin (e.g. Blog Posts, Post Carousel)',
				parentType: 'product',
				parentId: 'PQR',
				keywords: [ 'blog' ],
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

	const indexedReportingConfig: IndexedReportingConfig = {
		backup: [ { type: 'featureGroup', id: 'DEF', weight: 1 } ],
		blog: [ { type: 'feature', id: 'STU', weight: 1 } ],
		carousel: [ { type: 'feature', id: 'STU', weight: 1 } ],
		newspack: [ { type: 'feature', id: 'STU', weight: 1 } ],
		posts: [ { type: 'feature', id: 'STU', weight: 1 } ],
		site: [ { type: 'featureGroup', id: 'DEF', weight: 1 } ],
		traffic: [ { type: 'product', id: 'ABC', weight: 1 } ],
	};

	async function search( user: ReturnType< typeof userEvent.setup >, searchTerm: string ) {
		await user.click( screen.getByRole( 'textbox', { name: 'Search for a feature' } ) );
		await user.keyboard( searchTerm );
		// Bypass debouncing by hitting enter
		await user.keyboard( '{Enter}' );
	}

	function setup( component: ReactElement ) {
		const apiClient = createMockApiClient();
		const user = userEvent.setup();
		const view = renderWithProviders( component, {
			apiClient,
			preloadedState: {
				reportingConfig: {
					normalized: reportingConfig,
					indexed: indexedReportingConfig,
					loadError: null,
				},
			},
		} );

		return {
			user,
			...view,
		};
	}

	describe( 'Search matches at different levels', () => {
		test( 'Matching a product filters to that product collapsed', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'abc' );

			expect(
				screen.getByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).toBeInTheDocument();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /Group/ } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: /Feature/ } ) ).not.toBeInTheDocument();
		} );

		test( 'Matching a feature group filters to that feature group collapsed and its parent product', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'def' );

			expect(
				screen.getByRole( 'button', { expanded: false, name: 'DEF Group' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).toBeInTheDocument();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'MNO Group' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: /Feature/ } ) ).not.toBeInTheDocument();
		} );

		test( 'Matching a feature under product filters to that feature and its parent product', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'stu' );

			expect( screen.getByRole( 'option', { name: 'STU Feature' } ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).toBeInTheDocument();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'ABC Product' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /Group/ } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'VWX Feature' } ) ).not.toBeInTheDocument();
		} );

		test( 'Matching a feature under group filters to that feature and both parent levels', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'jkl' );

			expect( screen.getByRole( 'option', { name: 'JKL Feature' } ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'DEF Group' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).toBeInTheDocument();

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'MNO Group' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'GHI Feature' } ) ).not.toBeInTheDocument();
		} );

		test( 'Matching a feature keyword displays the keyword in a pill', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'yzz' );

			// There's a weird bug somewhere in the virtual DOM or React Testing Library that is adding a space
			// around the accessible name for the keyword match result. This doesn't reproduce in an actual browser.
			// We work around by checking out the text node.
			expect( screen.getByRole( 'option', { name: /VWX Feature/ } ) ).toHaveTextContent(
				'keyword match'
			);
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).toBeInTheDocument();
		} );

		test( 'Matching a product description filters to that product collapsed', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'traffic' );

			expect(
				screen.getByRole( 'button', { expanded: false, name: /ABC Product/ } )
			).toBeInTheDocument();

			expect( screen.getByRole( 'button', { name: /ABC Product/ } ) ).toHaveTextContent(
				'description match'
			);

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /Group/ } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: /Feature/ } ) ).not.toBeInTheDocument();
		} );

		test( 'Matching a feature group description filters to that feature group and its product', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'site backup' );

			expect(
				screen.getByRole( 'button', { expanded: false, name: /DEF Group/ } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'button', { expanded: false, name: /DEF Group/ } )
			).toHaveTextContent( 'description match' );

			expect(
				screen.getByRole( 'button', { expanded: false, name: /ABC Product/ } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'button', { expanded: false, name: /ABC Product/ } )
			).not.toHaveTextContent( 'description match' );

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'PQR Product' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'GHI Feature' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'JKL Feature' } ) ).not.toBeInTheDocument();
		} );

		test( 'Matching a feature description under product filters to that feature and its parent product', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'blog posts' );

			expect( screen.getByRole( 'option', { name: /STU Feature/ } ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).toBeInTheDocument();

			expect(
				screen.getByRole( 'button', { expanded: false, name: /PQR Product/ } )
			).not.toHaveTextContent( 'description match' );

			// Test important exclusions
			expect( screen.queryByRole( 'button', { name: 'ABC Product' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /Group/ } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'VWX Feature' } ) ).not.toBeInTheDocument();
		} );

		test( 'Matching both feature keyword and description shows the keyword match', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'blog' );

			expect( screen.getByRole( 'option', { name: /STU Feature/ } ) ).toHaveTextContent(
				'keyword match'
			);
		} );

		test( 'If no matches are found, shows a no results message', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'asdfhjklajvhxc ygaisudsudyfiuasd' );

			expect(
				screen.getByText( 'No results found. Try a different search or explore manually below.' )
			).toBeInTheDocument();
		} );

		test( 'If matches are found, shows a screen-reader-only results message', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'abc' );

			const message = screen.getByText( 'Results found. Search results are below.' );
			expect( message ).toBeInTheDocument();
			expect( message ).toHaveClass( 'screenReaderOnly' );
		} );

		test( 'If no matches are found, shows the initial tree state of all products collapsed', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'asdfhjklajvhxc ygaisudsudyfiuasd' );

			expect(
				screen.getByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).toBeInTheDocument();
		} );
	} );

	describe( 'Other search result behavior', () => {
		test( 'Search result matches highlight the search term', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'ghi' );

			const highlightedMatches = screen.getAllByTestId( 'highlighted-text-match' );
			expect( highlightedMatches.length ).toBe( 1 );
			expect( highlightedMatches[ 0 ]?.textContent ).toBe( 'GHI' );
		} );

		test( 'The selected feature details will highlight the search term in keywords', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'yzz' );
			await user.click( screen.getByRole( 'option', { name: /VWX Feature/ } ) );

			const highlightedMatches = screen.getAllByTestId( 'highlighted-text-match' );
			expect( highlightedMatches.length ).toBe( 1 );
			expect( highlightedMatches[ 0 ]?.textContent ).toBe( 'YZZ' );
		} );

		test( 'The selected feature details will highlight matching tokens from the search in the description', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			// Let's test an out-of-order match with a non-matching word and some junk symbols, for extra honesty!
			await search( user, 'carousel foo #@&^*?>- newspack' );
			await user.click( screen.getByRole( 'option', { name: /STU Feature/ } ) );

			const highlightedMatches = screen.getAllByTestId( 'highlighted-text-match' );
			expect( highlightedMatches.length ).toBe( 2 );
			expect( highlightedMatches[ 0 ]?.textContent ).toBe( 'Newspack' );
			expect( highlightedMatches[ 1 ]?.textContent ).toBe( 'Carousel' );
		} );

		test( 'You can expand result parents to see other non-matches', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'ghi' );
			await user.click( screen.getByRole( 'button', { expanded: false, name: 'DEF Group' } ) );

			expect(
				screen.getByRole( 'button', { expanded: true, name: 'DEF Group' } )
			).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'GHI Feature' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: 'JKL Feature' } ) ).toBeInTheDocument();
		} );

		test( 'Recollapsing an expanded parent will always only show search matches', async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, 'ghi' );
			await user.click( screen.getByRole( 'button', { expanded: false, name: 'DEF Group' } ) );
			await user.click( screen.getByRole( 'button', { expanded: true, name: 'DEF Group' } ) );

			expect( screen.getByRole( 'option', { name: 'GHI Feature' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: 'JKL Feature' } ) ).not.toBeInTheDocument();
		} );

		test( 'Description search matches must match at least 60% of the search term tokens', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await search( user, 'blog carousel newspack foo bar' );
			expect( screen.getByRole( 'option', { name: /STU Feature/ } ) ).toBeInTheDocument();

			await search( user, 'blog carousel newspack foo bar baz' );
			expect(
				screen.getByText( 'No results found. Try a different search or explore manually below.' )
			).toBeInTheDocument();
		} );

		test( "If you search for only white space, it doesn't search", async () => {
			const { user } = setup( <FeatureSelectorForm /> );
			await search( user, ' ' );
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).toBeInTheDocument();
		} );

		test( 'Clearing the field only resets the results after pressing enter', async () => {
			const { user } = setup( <FeatureSelectorForm /> );

			await search( user, 'abc' );

			await user.clear( screen.getByRole( 'textbox', { name: 'Search for a feature' } ) );

			expect( screen.getByText( 'Results found. Search results are below.' ) ).toBeInTheDocument();

			await user.keyboard( '{Enter}' );

			expect(
				screen.getByRole( 'button', { expanded: false, name: 'ABC Product' } )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { expanded: false, name: 'PQR Product' } )
			).toBeInTheDocument();
		} );
	} );
} );
