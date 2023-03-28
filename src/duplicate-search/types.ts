import { AvailableRepoFiltersApiResponse } from '../api/types';
import { IssueStatus } from '../duplicate-results/types';

export type IssueStatusFilter = 'all' | IssueStatus;
export type IssueSortOption = 'date-created' | 'relevance';

export interface DuplicateSearchState {
	searchTerm: string;
	activeRepoFilters: string[];
	statusFilter: IssueStatusFilter;
	sort: IssueSortOption;
	availableRepoFilters: AvailableRepoFilters;
}

export interface AvailableRepoFilters {
	repos: AvailableRepoFiltersApiResponse;
	requestStatus: 'empty' | 'loading' | 'loaded' | 'error';
	requestError: string | null;
}
