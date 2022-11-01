import { LearnMoreLink, TaskDetails } from '../reporting-config';

/**
 * An interface representing an interaction with the API.
 * Can create multiple implementations to support local testing and production deployment.
 */
export interface ApiClient {
	loadReportingConfig(): Promise< ReportingConfigApiResponse >;
	// More to come as we add to the API
	// e.g. searchForDuplicats();
	// e.g. saveNewReportingConfig();
}

/**
 * The issue reporting config as stored in and fetched from the database.
 * It follows a more heirarchical structure for easy reading and manual updating.
 */
export interface ReportingConfigApiResponse {
	[ productName: string ]: Product;
}

interface Product {
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	tasks?: Tasks;
	featureGroups?: FeatureGroups;
	features?: Features;
}

interface FeatureGroups {
	[ featureGroupName: string ]: FeatureGroup;
}

interface FeatureGroup {
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	tasks?: Tasks;
	features: Features;
}

interface Features {
	[ featureName: string ]: Feature;
}

interface Feature {
	keywords?: string[];
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	tasks?: Tasks;
}

interface Tasks {
	bug: TaskDetails[];
	featureRequest: TaskDetails[];
	blocker: TaskDetails[];
}
