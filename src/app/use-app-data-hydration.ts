import { useEffect, useState } from 'react';
import { useAppDispatch } from './hooks';
import history from 'history/browser';
import { queryToState } from '../url-history/parsers';
import { updateStateFromHistory } from '../url-history/actions';
import { loadStaticData } from '../static-data/load-static-data';

/**
 * Hook that streamlines all the initial data loading and hydration into a single boolean state value.
 */
export function useAppDataHydration() {
	const dispatch = useAppDispatch();
	const [ hydrationIsComplete, setHydrationIsComplete ] = useState( false );

	// The order here matters! We validate some state from the URL against configuration from the API.
	// So we need to load all the configuration first, then update the state from the URL.
	useEffect( () => {
		async function hydrateData() {
			await dispatch( loadStaticData() );

			const initialStateQuery = history.location.search;
			const initialState = queryToState( initialStateQuery );
			dispatch( updateStateFromHistory( initialState ) );

			setHydrationIsComplete( true );
		}

		hydrateData();
	}, [ dispatch ] );

	return hydrationIsComplete;
}
