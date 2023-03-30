import { AvailableRepoFiltersApiResponse } from '../../api/types';

export interface AvailableRepoFiltersState {
	repos: AvailableRepoFiltersApiResponse;
	loadError: string | null;
}
