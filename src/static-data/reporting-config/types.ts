import { StaticDataLoadStatus } from '../types';

/**
 * The operation-focused, client representation of the issue reporting config.
 * We take the backend JSON and normalize it and index it to make it more usable by the client.
 */
export interface ReportingConfigState {
	normalized: NormalizedReportingConfig;
	indexed: IndexedReportingConfig;
	loadStatus: StaticDataLoadStatus;
	loadError: string | null;
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

export interface Features {
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

export interface FeatureGroups {
	[ featureGroupId: string ]: FeatureGroup;
}

export interface FeatureGroup {
	id: string;
	name: string;
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	productId: string;
	featureIds: string[];
}

export interface Products {
	[ productId: string ]: Product;
}

export interface Product {
	id: string;
	name: string;
	description?: string;
	learnMoreLinks?: LearnMoreLink[];
	taskMapping?: TaskMapping;
	featureGroupIds: string[];
	featureIds: string[];
}

export interface Tasks {
	[ taskId: string ]: Task;
}

export interface Task extends TaskDetails {
	parentType: TaskParentEntityType;
	parentId: string;
	id: string;
}

export interface TaskMapping {
	bug: string[];
	featureRequest: string[];
	urgent: string[];
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
	href: string;
}

export interface NewGitHubIssueLink {
	type: 'github';
	repository: string; // "Automattic/wp-calypso" e.g.
	template?: string; // "bug_report.yml" e.g.
	projectSlugs?: string[]; // "Automattic/xyz" e.g.
	labels?: string[]; // "[Pri] High" e.g.
}

export type TaskLink = SlackLink | P2Link | GeneralLink | NewGitHubIssueLink;

export interface TaskDetails {
	title?: string;
	details?: string;
	link?: TaskLink;
}

interface LinkWithDisplayText {
	displayText?: string;
}

export type LearnMoreLink =
	| ( LinkWithDisplayText & SlackLink )
	| ( LinkWithDisplayText & P2Link )
	| ( LinkWithDisplayText & GeneralLink );

export interface LearnMore {
	description?: string;
	links?: LearnMoreLink[];
}
