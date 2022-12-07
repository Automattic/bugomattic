export type IssueType = 'unset' | 'bug' | 'featureRequest' | 'blocker';
export type FeatureId = string | null;
export interface IssueDetails {
	featureId: FeatureId;
	issueType: IssueType;
	issueTitle: string;
}

export interface FilteredResults {
	products: Set< string >;
	featureGroups: Set< string >;
	features: Set< string >;
}
