// This is hard-coded file required by the Create React App scripts.
// When we inevitably "eject" and go to our own build scripts, we will move or rename this this.

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock out the Confetti component, as it uses a canvas element that JSDOM doesn't support.
jest.mock( 'react-confetti', () => {
	return function MockConfetti() {
		return <div data-testid="mock-confetti"></div>;
	};
} );

// Needed for the various popovers from FloatingUI
class MockResizeObserver {
	observe = jest.fn();
	unobserve = jest.fn();
	disconnect = jest.fn();
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// We have a couple of scroll to the tops
globalThis.scrollTo = jest.fn();
