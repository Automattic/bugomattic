import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DebouncedSearch } from '../debounced-search';
import userEvent from '@testing-library/user-event';

describe( '[DebouncedSearch]', () => {
	const placeholderText = 'Search for something...';
	const searchText = 'foo bar';

	function setup( {
		debounceMs,
		debounceCharacterMinimum,
	}: {
		debounceMs: number;
		debounceCharacterMinimum?: number;
	} ) {
		const mockCallBack = jest.fn();
		const user = userEvent.setup();
		const view = render(
			<DebouncedSearch
				placeholder={ placeholderText }
				debounceMs={ debounceMs }
				debounceCharacterMinimum={ debounceCharacterMinimum }
				callback={ mockCallBack }
			/>
		);
		return {
			mockCallBack,
			user,
			...view,
		};
	}

	it( 'Calls callback with search string', async () => {
		const { mockCallBack, user } = setup( { debounceMs: 0 } );
		await user.click( screen.getByPlaceholderText( placeholderText ) );
		await user.keyboard( searchText );

		expect( mockCallBack ).toHaveBeenLastCalledWith( searchText );
	} );

	it( 'Waits for the debounced time before calling callback', async () => {
		// The 50ms is a good time to keep tests fast, but stable with the delays that come with react testing library.
		const debounceMs = 50;
		const { mockCallBack, user } = setup( { debounceMs: debounceMs } );
		await user.click( screen.getByPlaceholderText( placeholderText ) );
		await user.keyboard( searchText );

		// Shouldn't be called at first (on the immediate next event loop)
		expect( mockCallBack ).not.toHaveBeenCalledWith( searchText );
		// But should be called within a few ms of the debounce time!
		await waitFor( () => expect( mockCallBack ).toHaveBeenLastCalledWith( searchText ), {
			timeout: debounceMs + 10,
		} );
	} );

	it( 'Clicking the search icon button skips debounce', async () => {
		const debounceMs = 5 * 1000; // Make this obviously long
		const { mockCallBack, user } = setup( { debounceMs: debounceMs } );
		await user.click( screen.getByPlaceholderText( placeholderText ) );
		await user.keyboard( searchText );

		// Shouldn't be called yet -- we are debouncing
		expect( mockCallBack ).not.toHaveBeenCalledWith( searchText );

		// This is the search button
		await user.click( screen.getByRole( 'button', { hidden: true } ) );
		// Should now be called on the next event loop, skipping debounce
		expect( mockCallBack ).toHaveBeenLastCalledWith( searchText );
	} );

	it( 'Typing "enter" key skips debounce', async () => {
		const debounceMs = 5 * 1000; // Make this obviously long
		const { mockCallBack, user } = setup( { debounceMs: debounceMs } );
		await user.click( screen.getByPlaceholderText( placeholderText ) );
		await user.keyboard( searchText );

		// Shouldn't be called yet -- we are debouncing
		expect( mockCallBack ).not.toHaveBeenCalledWith( searchText );

		await user.keyboard( '{Enter}' );
		// Should now be called on the next event loop, skipping debounce
		expect( mockCallBack ).toHaveBeenLastCalledWith( searchText );
	} );

	it( 'If provided, includes the class name on the input element', () => {
		const className = 'test-class';
		render(
			<DebouncedSearch
				callback={ jest.fn() }
				className={ className }
				placeholder={ placeholderText }
			/>
		);
		expect( screen.getByPlaceholderText( placeholderText ) ).toHaveClass( className );
	} );

	it( 'If a character minimum is provided, only calls debounced callback when that many characters are entered', async () => {
		const { mockCallBack, user } = setup( { debounceMs: 0, debounceCharacterMinimum: 3 } );
		await user.click( screen.getByPlaceholderText( placeholderText ) );

		await user.keyboard( 'a' );
		// Not over minimum yet
		expect( mockCallBack ).not.toHaveBeenCalled();

		await user.keyboard( 'b' );
		// Still not over... hooooooold...
		expect( mockCallBack ).not.toHaveBeenCalled();

		await user.keyboard( 'c' );
		// AT MINIMUM, GO GO GO GO
		expect( mockCallBack ).toHaveBeenLastCalledWith( 'abc' );
		expect( mockCallBack ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Typing "enter" or clicking search button bypasses the character minimum', async () => {
		const { mockCallBack, user } = setup( { debounceMs: 0, debounceCharacterMinimum: 3 } );
		await user.click( screen.getByPlaceholderText( placeholderText ) );

		await user.keyboard( 'a' );
		expect( mockCallBack ).not.toHaveBeenCalled();

		await user.keyboard( '{Enter}' );
		expect( mockCallBack ).toHaveBeenLastCalledWith( 'a' );

		await user.keyboard( 'b' );
		expect( mockCallBack ).not.toHaveBeenLastCalledWith( 'ab' );

		await user.click( screen.getByRole( 'button', { hidden: true } ) );
		expect( mockCallBack ).toHaveBeenLastCalledWith( 'ab' );
	} );

	it( "If the same term is entered within the debounce window, won't call callback again unless forced action is taken", async () => {
		const testText = 'abc';
		const debounceMs = 50;
		const { mockCallBack, user } = setup( { debounceMs } );
		await user.click( screen.getByPlaceholderText( placeholderText ) );
		await user.keyboard( testText );

		// First debounce fires
		await waitFor( () => expect( mockCallBack ).toHaveBeenLastCalledWith( testText ), {
			timeout: debounceMs + 10,
		} );

		// Remove last character and quickly add it back within debounce window
		await user.keyboard( '{Backspace}c' );

		// Wait for the debounce window, the callback should not be called again
		await new Promise( ( resolve ) => setTimeout( resolve, debounceMs + 10 ) );
		expect( mockCallBack ).toHaveBeenCalledTimes( 1 );

		// Hit enter, the callback should be called again, even though term is the same
		await user.keyboard( '{Enter}' );
		expect( mockCallBack ).toHaveBeenCalledTimes( 2 );

		// Hit search button, the callback should be called again, even though term is the same
		await user.click( screen.getByRole( 'button', { hidden: true } ) );
		expect( mockCallBack ).toHaveBeenCalledTimes( 3 );
	} );

	describe( 'Whitespace trimming', () => {
		const searchTermWithWhitespace = '  abc  ';
		const expectedEmittedTerm = 'abc';
		it( 'On debounce, we only emit the trimmed search term, but do not change the input value until blur', async () => {
			const debounceMs = 50;
			const { mockCallBack, user } = setup( { debounceMs } );
			await user.click( screen.getByPlaceholderText( placeholderText ) );
			await user.keyboard( searchTermWithWhitespace );

			await waitFor( () => expect( mockCallBack ).toHaveBeenLastCalledWith( expectedEmittedTerm ), {
				timeout: debounceMs + 10,
			} );

			expect( screen.getByPlaceholderText( placeholderText ) ).toHaveValue(
				searchTermWithWhitespace
			);

			fireEvent.blur( screen.getByPlaceholderText( placeholderText ) );

			expect( screen.getByPlaceholderText( placeholderText ) ).toHaveValue( expectedEmittedTerm );
			expect( mockCallBack ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'On enter, we emit a trimmed search term and change the input value to the trimmed value', async () => {
			const { mockCallBack, user } = setup( { debounceMs: 0 } );
			await user.click( screen.getByPlaceholderText( placeholderText ) );
			await user.keyboard( searchTermWithWhitespace );
			await user.keyboard( '{Enter}' );

			expect( mockCallBack ).toHaveBeenLastCalledWith( expectedEmittedTerm );
			expect( screen.getByPlaceholderText( placeholderText ) ).toHaveValue( expectedEmittedTerm );
		} );
	} );
} );
