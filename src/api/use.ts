import { useContext } from 'react';
import { ApiContext } from './context';

export function useApi() {
	return useContext( ApiContext );
}
