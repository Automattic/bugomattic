import React, { ReactNode } from 'react';
import { ApiContext } from '../context';
import { productionApiClient } from './api-client';

interface Props {
	children: ReactNode;
}

/**
 * A provider for the production API client, making real HTTP requests to the backend REST API.
 */
export function ProductionApiProvider( { children }: Props ) {
	return <ApiContext.Provider value={ productionApiClient }>{ children }</ApiContext.Provider>;
}
