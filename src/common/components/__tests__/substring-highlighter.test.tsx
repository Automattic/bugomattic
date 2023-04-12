import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubstringHighlighter } from '../substring-hightlighter';

describe( '[SubstringHighlighter]', () => {
	const testId = 'highlighted-substring';
	const highlightClassName = 'fake-class-name';

	function makeExactMatchRegex( string: string ) {
		return new RegExp( `^${ string }$` );
	}

	describe( 'Matching a substring', () => {
		test( 'Correctly "highlights" a substring match at the start of a string', () => {
			const substring = 'foo';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `${ substring } end'` }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'Correctly "highlights" a substring match in the middle of a string', () => {
			const substring = 'foo';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `start ${ substring } end'` }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'Correctly "highlights" a substring match at the end of a string', () => {
			const substring = 'foo';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `start ${ substring }'` }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'If the entire string is a match, "highlights" the entire string', () => {
			const substring = 'foo';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ substring }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
		} );

		test( 'If the string contains multiple matches, "highlights" all of them', () => {
			const substring = 'foo';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `${ substring } bar ${ substring }bar bar${ substring }` }
				</SubstringHighlighter>
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
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `${ substring }${ substring }` }
				</SubstringHighlighter>
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
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					no match
				</SubstringHighlighter>
			);

			expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
		} );

		test( 'If an empty substring is provided, does not "highlight" any part of the string', () => {
			const substring = '';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					testing empty
				</SubstringHighlighter>
			);

			expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
		} );

		test( 'It correctly handles a substring with regex characters', () => {
			const substring = 'foo.-^&{}[]\\|?/+*()$';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ `bar ${ substring }` }
				</SubstringHighlighter>
			);

			// Not using exact match regex because the string contains regex characters
			expect( screen.getByTestId( testId ) ).toHaveTextContent( substring );
		} );

		test( 'If the content is an empty string, does not "highlight" any part of the string', () => {
			const substring = 'foo';
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
					{ '' }
				</SubstringHighlighter>
			);

			expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Matching a regex', () => {
		test( 'Correctly "highlights" a regex match at the start of a string', () => {
			const regex = /foo/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `foo end'` }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'Correctly "highlights" a regex match in the middle of a string', () => {
			const regex = /foo/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `start foo end'` }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'Correctly "highlights" a regex match at the end of a string', () => {
			const regex = /foo/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `start foo'` }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'If the entire string is a match, "highlights" the entire string', () => {
			const regex = /foo/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo' }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'foo' ) );
		} );

		test( 'If the string contains multiple matches, "highlights" all of them', () => {
			const regex = /foo/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ `foo bar foobar barfoo` }
				</SubstringHighlighter>
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
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foofoo' }
				</SubstringHighlighter>
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
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'xaaax' }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'aaa' ) );
		} );

		test( 'It handles regexes with options and potential overlaps', () => {
			const regex = /fo|foo/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo bar' }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'fo' ) );
		} );

		test( 'It handles regexes that use open ended ranges', () => {
			const regex = /\d+/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'abc123xyz' }
				</SubstringHighlighter>
			);

			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( '123' ) );
		} );

		test( 'It handles capture groups', () => {
			const regex = /foo(.*?)bar/g;
			render(
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo123bar foo+++bar' }
				</SubstringHighlighter>
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
				<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ regex }>
					{ 'foo #a#b@c@ bar' }
				</SubstringHighlighter>
			);

			// This may seem weird, but this is technically correct. We need to make sure we're just not doing anything wonky!
			expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( 'a#b' ) );
		} );
	} );

	test( 'It includes the provided classname on the "highlighted" span', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } textMatch={ substring }>
				{ `start ${ substring } end'` }
			</SubstringHighlighter>
		);

		expect( screen.getByTestId( testId ) ).toHaveClass( highlightClassName );
	} );
} );
