export interface ReportingConfig {
	normalized: NormalizedReportingConfig;
	indexed: IndexedReportingConfig;
}

export interface NormalizedReportingConfig {
	features: Features;
	featureGroups: FeatureGroups;
	products: Products;
}

export interface IndexedReportingConfig {
	foo: string; // To-do, figure out what indices we need.
}

interface Features {
	[ featureId: string ]: Feature;
}

interface Feature {
	id: string;
	name: string;
	keywords?: string[];
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	featureGroup?: string;
	product?: string;
}

interface FeatureGroups {
	[ featureGroupId: string ]: FeatureGroup;
}

interface FeatureGroup {
	id: string;
	name: string;
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	product: string;
}

interface Products {
	[ productId: string ]: Product;
}

interface Product {
	id: string;
	name: string;
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
}

export interface SlackLink {
	type: 'slack';
	channel: string;
}

export interface P2Link {
	type: 'p2';
	subdomain: string;
}

export interface GeneralLink {
	type: 'general';
	displayText?: string;
	href: string;
}

export interface NewGitHubIssueLink {
	type: 'github';
	repository: string; // Automattic/wp-calypso, e.g.
	template?: string;
	projectSlugs?: string[];
	labels?: string[];
}

export type LearnMoreLink = SlackLink | P2Link | GeneralLink;

export type TaskLink = LearnMoreLink | NewGitHubIssueLink;

export interface Task {
	instructions?: string;
	link?: TaskLink;
}

export interface LearnMore {
	description?: string;
	links?: LearnMoreLink[];
}

export interface TaskMapping {
	bug: Task[];
	featureRequest: Task[];
	showStopper: Task[];
}
