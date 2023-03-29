import { useEffect } from 'react';
import { loadReportingConfig } from './reporting-config/reporting-config-slice';
import { useAppDispatch } from '../app/hooks';
import { loadAvailableRepoFilters } from './available-repo-filters/available-repo-filters-slice';

export function useStaticDataLoad() {
	const dispatch = useAppDispatch();

	useEffect( () => {
		dispatch( loadAvailableRepoFilters() );
		dispatch( loadReportingConfig() );
	}, [ dispatch ] );
}
