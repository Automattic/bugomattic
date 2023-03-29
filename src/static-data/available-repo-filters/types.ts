import { AvailableRepoFiltersApiResponse } from '../../api/types';
import { StaticDataLoadStatus } from '../types';

export interface AvailableRepoFiltersState {
	repos: AvailableRepoFiltersApiResponse;
	loadStatus: StaticDataLoadStatus;
	loadError: string | null;
}
