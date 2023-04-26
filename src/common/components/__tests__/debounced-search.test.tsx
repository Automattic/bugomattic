import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
} );
