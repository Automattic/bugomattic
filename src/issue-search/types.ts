import { IssueStatus } from '../issue-search-results/types';

export type IssueStatusFilter = 'all' | IssueStatus;
export type IssueSortOption = 'date-created' | 'relevance';
export type ReportIssueLocation = 'banner' | 'navbar';

export interface IssueSearchState {
	searchTerm: string;
	// Naming is to differentiate from the "available" repo filters.
	activeRepoFilters: string[];
	statusFilter: IssueStatusFilter;
	sort: IssueSortOption;
}
