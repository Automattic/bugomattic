import { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import history from 'history/browser';
import { updateStateFromHistory } from './actions';
import { queryToState } from './parsers';

export function useInitialStateFromUrl() {
	const dispatch = useAppDispatch();
	useEffect( () => {
		const initialStateParams = history.location.search;
		const initialState = queryToState( initialStateParams );
		dispatch( updateStateFromHistory( initialState ) );
	}, [ dispatch ] );
}
