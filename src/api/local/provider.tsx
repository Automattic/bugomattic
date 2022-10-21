import React, { FC, ReactNode } from 'react';
import { ApiContext } from '../context';
import { localApiClient } from './api-client';

interface Props {
	children: ReactNode;
}

export const LocalApiProvider: FC< Props > = ( { children } ) => {
	return <ApiContext.Provider value={ localApiClient }>{ children }</ApiContext.Provider>;
};
