import { NormalizedReportingConfig } from './reporting-config/types';

export type StaticDataLoadStatus = 'empty' | 'loading' | 'loaded' | 'error';

/**
 * The static data references that are added to every Redux action.
 */
export interface StaticDataReference {
	availableRepoFilters: string[];
	reportingConfig: NormalizedReportingConfig;
}
