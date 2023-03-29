import { useEffect } from 'react';
import { loadAvailableRepoFilters } from '../duplicate-search/duplicate-search-slice';
import { loadReportingConfig } from '../reporting-config/reporting-config-slice';
import { useAppDispatch } from './hooks';

export function useAppDataLoad() {
	const dispatch = useAppDispatch();

	useEffect( () => {
		dispatch( loadAvailableRepoFilters() );
		dispatch( loadReportingConfig() );
	}, [ dispatch ] );
}
