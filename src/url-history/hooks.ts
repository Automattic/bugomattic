import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import history from 'history/browser';
import { updateStateFromHistory } from './actions';
import { queryToState } from './parsers';
import { selectReportingConfigLoadStatus } from '../static-data/reporting-config/reporting-config-slice';

export function useInitialStateFromUrl() {
	const dispatch = useAppDispatch();
	const reportingConfigLoadStatus = useAppSelector( selectReportingConfigLoadStatus );
	useEffect( () => {
		if ( reportingConfigLoadStatus !== 'loaded' ) {
			return;
		}
		const initialStateParams = history.location.search;
		const initialState = queryToState( initialStateParams );
		dispatch( updateStateFromHistory( initialState ) );
	}, [ dispatch, reportingConfigLoadStatus ] );
}
