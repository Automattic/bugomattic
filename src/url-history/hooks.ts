import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import history from 'history/browser';
import { updateStateFromHistory } from './actions';
import { queryToState } from './parsers';
import { selectReportingConfigLoadStatus } from '../static-data/reporting-config/reporting-config-slice';
import { selectAvailableRepoFiltersLoadStatus } from '../static-data/available-repo-filters/available-repo-filters-slice';

export function useInitialStateFromUrl() {
	const dispatch = useAppDispatch();
	const reportingConfigLoadStatus = useAppSelector( selectReportingConfigLoadStatus );
	const availableRepoFiltersLoadStatus = useAppSelector( selectAvailableRepoFiltersLoadStatus );
	useEffect( () => {
		if ( reportingConfigLoadStatus !== 'loaded' || availableRepoFiltersLoadStatus !== 'loaded' ) {
			return;
		}
		const initialStateParams = history.location.search;
		const initialState = queryToState( initialStateParams );
		dispatch( updateStateFromHistory( initialState ) );
	}, [ dispatch, reportingConfigLoadStatus, availableRepoFiltersLoadStatus ] );
}
