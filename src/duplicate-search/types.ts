import { IssueStatus } from '../duplicate-results/types';

export type IssueStatusFilter = 'all' | IssueStatus;
export type IssueSortOption = 'date-created' | 'relevance';

export interface DuplicateSearchState {
	searchTerm: string;
	activeRepoFilters: string[];
	statusFilter: IssueStatusFilter;
	sort: IssueSortOption;
}
