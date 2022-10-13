import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../app';

test( 'Sample test', () => {
	render( <App /> );
	expect( screen.getByRole( 'heading' ) ).toHaveTextContent( 'Bugomattic' );
} );
