import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextMatchHighlighter } from '../text-match-hightlighter';

describe( '[TextMatchHighlighter]', () => {
	const testId = 'highlighted-text-match';
	const highlightClassName = 'fake-class-name';

	function makeExactMatchRegex( string: string ) {
		return new RegExp( `^${ string }$` );
	}

	describe( 'Matching a substring', () => {
		test( 'Correctly "highlights" a substring match at the start of a string', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `${ substring } end'` }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'Correctly "highlights" a substring match in the middle of a string', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `start ${ substring } end'` }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'Correctly "highlights" a substring match at the end of a string', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `start ${ substring }'` }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'If the entire string is a match, "highlights" the entire string', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ substring }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'If the string contains multiple matches, "highlights" all of them', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `${ substring } bar ${ substring }bar bar${ substring }` }
				</TextMatchHighlighter>
			);

			const matches = screen.getAllByTestId( testId );
			expect( matches ).toHaveLength( 3 );

			matches.forEach( ( match ) => {
				expect( match ).toHaveTextContent( makeExactMatchRegex( substring ) );
			} );
		} );

		test( 'If the string has back-to-back matches, "highlights" all of them', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `${ substring }${ substring }` }
				</TextMatchHighlighter>
			);

			const matches = screen.getAllByTestId( testId );
			expect( matches ).toHaveLength( 2 );

			matches.forEach( ( match ) => {
				expect( match ).toHaveTextContent( makeExactMatchRegex( substring ) );
			} );
		} );

		test( 'If the substring is not found, does not "highlight" any part of the string', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					no match
				</TextMatchHighlighter>
			);

			expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
		} );

		test( 'If an empty substring is provided, does not "highlight" any part of the string', () => {
			const substring = '';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					testing empty
				</TextMatchHighlighter>
			);

			expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
		} );

		test( 'It correctly handles a substring with regex characters', () => {
			const substring = 'foo.-^&{}[]\\|?/+*()$';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `bar ${ substring }` }
				</TextMatchHighlighter>
			);

			// Not using exact match regex because the string contains regex characters
			expect( screen.getByTestId( testId ) ).toHaveTextContent( substring );
		} );

		test( 'If the content is an empty string, does not "highlight" any part of the string', () => {
			const substring = 'foo';
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ '' }
				</TextMatchHighlighter>
			);

			expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
		} );

		test( 'It correctly preserves all the rest of the string', () => {
			const substring = 'foo';
			const content = 'foo barfoofoo bar foo';
			render(
				<div data-testid="wrapper">
					<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
						{ content }
					</TextMatchHighlighter>
				</div>
			);

			expect( screen.getByTestId( 'wrapper' ) ).toHaveTextContent( content );
		} );
	} );

	describe( 'Matching a regex', () => {
		test( 'Correctly "highlights" a regex match at the start of a string', () => {
			const regex = /foo/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `foo end'` }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'Correctly "highlights" a regex match in the middle of a string', () => {
			const regex = /foo/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `start foo end'` }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'Correctly "highlights" a regex match at the end of a string', () => {
			const regex = /foo/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `start foo'` }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'If the entire string is a match, "highlights" the entire string', () => {
			const regex = /foo/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo' }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'If the string contains multiple matches, "highlights" all of them', () => {
			const regex = /foo/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `foo bar foobar barfoo` }
				</TextMatchHighlighter>
			);

			const matches = screen.getAllByTestId( testId );
			expect( matches ).toHaveLength( 3 );
			matches.forEach( ( match ) => {
				expect( match ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
			} );
		} );

		test( 'If the string has back-to-back matches, "highlights" all of them', () => {
			const regex = /foo/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foofoo' }
				</TextMatchHighlighter>
			);

			const matches = screen.getAllByTestId( testId );
			expect( matches ).toHaveLength( 2 );

			matches.forEach( ( match ) => {
				expect( match ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
			} );
		} );

		test( 'It handles regexes with ranges', () => {
			const regex = /a{1,3}/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'xaaax' }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'aaa' ) );
		} );

		test( 'It handles regexes with options and potential overlaps', () => {
			const regex = /fo|foo/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo bar' }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'fo' ) );
		} );

		test( 'It handles regexes that use open ended ranges', () => {
			const regex = /\d+/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'abc123xyz' }
				</TextMatchHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( '123' ) );
		} );

		test( 'It handles capture groups', () => {
			const regex = /foo(.*?)bar/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo123bar foo+++bar' }
				</TextMatchHighlighter>
			);

			const matches = screen.getAllByTestId( testId );
			expect( matches ).toHaveLength( 2 );

			expect( matches[ 0 ] ).toHaveTextContent( makeExactMatchRegex( '123' ) );
			// Regex chars, so can't do a complete match check
			expect( matches[ 1 ] ).toHaveTextContent( '+++' );
		} );

		test( 'It handles regexes with nested matches', () => {
			const regex = /#(.*?)@/g;
			render(
				<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo #a#b@c@ bar' }
				</TextMatchHighlighter>
			);

			// This may seem weird, but this is technically correct. We need to make sure we're just not doing anything wonky!
			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'a#b' ) );
		} );

		test( 'It correctly preserves the rest of the string', () => {
			const regex = /#(.*?)#/g;
			render(
				<div data-testid="wrapper">
					<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
						{ 'a #b# c #d#' }
					</TextMatchHighlighter>
				</div>
			);

			expect( screen.getByTestId( 'wrapper' ) ).toHaveTextContent( 'a b c d' );
		} );
	} );

	test( 'It includes the provided classname on the "highlighted" span', () => {
		const substring = 'foo';
		render(
			<TextMatchHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
				{ `start ${ substring } end'` }
			</TextMatchHighlighter>
		);

		expect( screen.getByTestId( testId ) ).toHaveClass( highlightClassName );
	} );
} );
