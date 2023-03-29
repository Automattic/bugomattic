import { useEffect, useState } from 'react';
import { useAppDispatch } from './hooks';
import { loadAvailableRepoFilters } from '../static-data/available-repo-filters/available-repo-filters-slice';
import { loadReportingConfig } from '../static-data/reporting-config/reporting-config-slice';
import history from 'history/browser';
import { queryToState } from '../url-history/parsers';
import { updateStateFromHistory } from '../url-history/actions';

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
			await Promise.all( [
				dispatch( loadAvailableRepoFilters() ),
				dispatch( loadReportingConfig() ),
			] );

			const initialStateParams = history.location.search;
			const initialState = queryToState( initialStateParams );
			dispatch( updateStateFromHistory( initialState ) );
			setHydrationIsComplete( true );
		}

		hydrateData();
	}, [ dispatch ] );

	return hydrationIsComplete;
}
