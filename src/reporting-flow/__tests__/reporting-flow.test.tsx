/**
 * @jest-environment ./src/test-utils/quit-early-environment.ts
 */

import React from 'react';

describe( '[Reporting Flow]', () => {
	test( 'Passes', () => {
		return;
	} );

	test( 'Fails', () => {
		throw new Error( 'fail' );
	} );

	test( 'Skip1', () => {
		return;
	} );

	test( 'Skip2', () => {
		return;
	} );
} );
