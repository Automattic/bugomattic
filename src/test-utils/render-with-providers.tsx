import React, { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { PreloadedState } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { setupStore } from '../app/store';
import type { AppStore, RootState } from '../app/store';
import { ApiClient } from '../api';

// This is a common pattern for overriding React Testing Library's 'render'
// function while hydrating in a redux store (and in our case, an API implementation).
// See https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit< RenderOptions, 'queries' > {
	apiClient: ApiClient;
	preloadedState?: PreloadedState< RootState >;
	store?: AppStore;
}

/**
 * An override of React Testing Libraries 'render' call that provides redux (and thus API) providers.
 *
 * @param {ReactElement} component The component under test to render
 * @param {ExtendedRenderOptions} param1 Options for rendering. An ApiClient is required.
 * @returns An object compatible with RTL's expected output from 'render'
 */
export function renderWithProviders(
	component: ReactElement,
	{
		apiClient,
		preloadedState = {},
		store = setupStore( apiClient, preloadedState ),
		...renderOptions
	}: ExtendedRenderOptions
) {
	function Wrapper( { children }: PropsWithChildren< {} > ): JSX.Element {
		return <Provider store={ store }>{ children }</Provider>;
	}

	return { store, ...render( component, { wrapper: Wrapper, ...renderOptions } ) };
}
