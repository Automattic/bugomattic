import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubstringHighlighter } from '../substring-hightlighter';

describe( '[SubstringHighlighter]', () => {
	const testId = 'highlighted-substring';
	const highlightClassName = 'fake-class-name';

	function makeExactMatchRegex( string: string ) {
		return new RegExp( `^${ string }$` );
	}

	test( 'Correctly "highlights" a substring match at the start of a string', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } substring={ substring }>
				{ `${ substring } end'` }
			</SubstringHighlighter>
		);

		expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
	} );

	test( 'Correctly "highlights" a substring match in the middle of a string', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } substring={ substring }>
				{ `start ${ substring } end'` }
			</SubstringHighlighter>
		);

		expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
	} );

	test( 'Correctly "highlights" a substring match at the end of a string', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } substring={ substring }>
				{ `start ${ substring }'` }
			</SubstringHighlighter>
		);

		expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
	} );

	test( 'If the entire string is a match, "highlights" the entire string', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } substring={ substring }>
				{ substring }
			</SubstringHighlighter>
		);

		expect( screen.getByTestId( testId ) ).toHaveTextContent( makeExactMatchRegex( substring ) );
	} );

	test( 'If the substring is not found, does not "highlight" any part of the string', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } substring={ substring }>
				no match
			</SubstringHighlighter>
		);

		expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
	} );

	test( 'If an empty substring is provided, does not "highlight" any part of the string', () => {
		const substring = '';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } substring={ substring }>
				testing empty
			</SubstringHighlighter>
		);

		expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
	} );

	test( 'It includes the provided classname on the "highlighted" span', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter highlightClassName={ highlightClassName } substring={ substring }>
				{ `start ${ substring } end'` }
			</SubstringHighlighter>
		);

		expect( screen.getByTestId( testId ) ).toHaveClass( highlightClassName );
	} );

	test( 'If ignoreCase is false, does not "hightlight" a substring with a case mismatch', () => {
		const substring = 'foo';
		render(
			<SubstringHighlighter
				ignoreCase={ false }
				highlightClassName={ highlightClassName }
				substring={ substring }
			>
				{ `start ${ substring.toUpperCase() } end'` }
			</SubstringHighlighter>
		);

		expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
	} );
} );
