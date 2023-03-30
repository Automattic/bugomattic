import { AppThunk } from '../app/store';
import { loadAvailableRepoFilters } from './available-repo-filters/available-repo-filters-slice';
import { loadReportingConfig } from './reporting-config/reporting-config-slice';

export const loadStaticData: () => AppThunk = () => async ( dispatch ) => {
	await Promise.all( [
		dispatch( loadAvailableRepoFilters() ),
		dispatch( loadReportingConfig() ),
	] );
};
