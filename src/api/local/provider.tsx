import React, { ReactNode } from 'react';
import { ApiContext } from '../context';
import { localApiClient } from './api-client';

interface Props {
	children: ReactNode;
}

export function LocalApiProvider( { children }: Props ) {
	return <ApiContext.Provider value={ localApiClient }>{ children }</ApiContext.Provider>;
}
