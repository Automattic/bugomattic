import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DebouncedSearch } from '../debounced-search';
import userEvent from '@testing-library/user-event';

describe( '[DebouncedSearch]', () => {
	const placeholderText = 'Search for something...';
	const searchText = 'foo bar';

	function setup( { debounceMs }: { debounceMs: number } ) {
		const mockCallBack = jest.fn();
		const user = userEvent.setup();
		const renderOutput = render(
			<DebouncedSearch
				placeholder={ placeholderText }
				debounceMs={ debounceMs }
				callback={ mockCallBack }
			/>
		);
		return {
			mockCallBack,
			user,
			...renderOutput,
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

		await user.click( screen.getByRole( 'button', { name: 'Search' } ) );
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
} );
