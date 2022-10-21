import { LearnMoreLink, TaskMapping } from '../reporting-config';

export interface ApiClient {
	loadReportingConfig(): Promise< ReportingConfigApiResponse >;
}

export interface ReportingConfigApiResponse {
	[ product: string ]: Product;
}

interface Product {
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	featureGroups?: FeatureGroups;
	features?: Features;
}

interface FeatureGroups {
	[ featureGroup: string ]: FeatureGroup;
}

interface FeatureGroup {
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	features: Features;
}

interface Features {
	[ feature: string ]: Feature;
}

interface Feature {
	keywords?: string[];
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
}
