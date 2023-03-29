import { useEffect, useState } from 'react';
import { useAppDispatch } from './hooks';
import { loadAvailableRepoFilters } from '../static-data/available-repo-filters/available-repo-filters-slice';
import { loadReportingConfig } from '../static-data/reporting-config/reporting-config-slice';
import history from 'history/browser';
import { queryToState } from '../url-history/parsers';
import { updateStateFromHistory } from '../url-history/actions';

export function useAppDataHydration() {
	const dispatch = useAppDispatch();
	const [ hydrationIsComplete, setHydrationIsComplete ] = useState( false );

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
