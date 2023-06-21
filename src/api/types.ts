import { Issue } from '../issue-search-results/types';
import { IssueSortOption, IssueStatusFilter } from '../issue-search/types';
import { LearnMoreLink, TaskDetails } from '../static-data/reporting-config/types';

/**
 * An interface representing an interaction with the API.
 * Can create multiple implementations to support local testing and production deployment.
 */
export interface ApiClient {
	loadReportingConfig(): Promise< ReportingConfigApiResponse >;
	searchIssues( search: string, options?: SearchIssueOptions ): Promise< SearchIssueApiResponse >;
	loadAvailableRepoFilters(): Promise< AvailableRepoFiltersApiResponse >;
	// More to come as we add to the API
	// e.g. saveNewReportingConfig();
}

/**
 * The issue reporting config as stored in and fetched from the database.
 * It follows a more heirarchical structure for easy reading and manual updating.
 */
export interface ReportingConfigApiResponse {
	[ productName: string ]: ApiProduct;
}

export interface ApiProduct {
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	tasks?: ApiTasks;
	featureGroups?: ApiFeatureGroups;
	features?: ApiFeatures;
}

export interface ApiFeatureGroups {
	[ featureGroupName: string ]: ApiFeatureGroup;
}

export interface ApiFeatureGroup {
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	tasks?: ApiTasks;
	features: ApiFeatures;
}

export interface ApiFeatures {
	[ featureName: string ]: ApiFeature;
}

export interface ApiFeature {
	keywords?: string[];
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	tasks?: ApiTasks;
}

export interface ApiTasks {
	bug: TaskDetails[];
	featureRequest: TaskDetails[];
	urgent: TaskDetails[];
}

export interface SearchIssueOptions {
	repos?: string[];
	status?: IssueStatusFilter;
	sort?: IssueSortOption;
}

export type SearchIssueApiResponse = Issue[];

export type AvailableRepoFiltersApiResponse = string[];
