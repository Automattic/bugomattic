/**
 * The operation-focused, client representation of the issue reporting config.
 * We take the backend JSON and normalize it and index it to make it more usable by the client.
 */
export interface ReportingConfigState {
	normalized: NormalizedReportingConfig;
	indexed: IndexedReportingConfig;
	status: 'empty' | 'loading' | 'loaded' | 'error';
	error: string | null;
}

/**
 * The issue reporting config noramlized, or "flattened", for easier client operations.
 */
export interface NormalizedReportingConfig {
	features: Features;
	featureGroups: FeatureGroups;
	products: Products;
	tasks: Tasks;
}

/**
 * Indices built from the reporting configuration to facilitate searching for features.
 * TODO: Implement, once we know what kind of searching we will support
 */
export interface IndexedReportingConfig {
	foo: string; // TODO: figure out what indices we need.
}

export type FeatureParentEntityType = 'product' | 'featureGroup';
export type TaskParentEntityType = FeatureParentEntityType | 'feature';

interface Features {
	[ featureId: string ]: Feature;
}

export interface Feature {
	id: string;
	name: string;
	keywords?: string[];
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	parentType: FeatureParentEntityType;
	parentId: string;
}

interface FeatureGroups {
	[ featureGroupId: string ]: FeatureGroup;
}

export interface FeatureGroup {
	id: string;
	name: string;
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	productId: string;
}

interface Products {
	[ productId: string ]: Product;
}

export interface Product {
	id: string;
	name: string;
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
}

export interface TaskMapping {
	bug: string[];
	featureRequest: string[];
	blocker: string[];
}

export interface Task extends TaskDetails {
	parentType: TaskParentEntityType;
	parentId: string;
}

export interface Tasks {
	[ taskId: string ]: Task;
}

export interface SlackLink {
	type: 'slack';
	channel: string; // "escalations" e.g., no "#" needed
}

export interface P2Link {
	type: 'p2';
	subdomain: string; // For private wordpress.com p2s
}

export interface GeneralLink {
	type: 'general';
	displayText?: string;
	href: string;
}

export interface NewGitHubIssueLink {
	type: 'github';
	repository: string; // "Automattic/wp-calypso" e.g.
	template?: string; // "bug_report.yml" e.g.
	projectSlugs?: string[]; // "Automattic/xyz" e.g.
	labels?: string[]; // "[Pri] High" e.g.
}

export type LearnMoreLink = SlackLink | P2Link | GeneralLink;

export type TaskLink = LearnMoreLink | NewGitHubIssueLink;

export interface TaskDetails {
	instructions?: string;
	link?: TaskLink;
}

export interface LearnMore {
	description?: string;
	links?: LearnMoreLink[];
}
