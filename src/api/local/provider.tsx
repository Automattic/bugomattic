import React, { ReactNode } from 'react';
import { ApiContext } from '../context';
import { localApiClient } from './api-client';

interface Props {
	children: ReactNode;
}

/**
 * A provider for the API that uses local, faked responses for local development and testing.
 */
export function LocalApiProvider( { children }: Props ) {
	return <ApiContext.Provider value={ localApiClient }>{ children }</ApiContext.Provider>;
}
