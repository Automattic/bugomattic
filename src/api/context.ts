import { createContext } from 'react';
import { ApiClient } from './types';

export const ApiContext = createContext< ApiClient | undefined >( undefined );
