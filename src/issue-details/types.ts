export type IssueType = 'unset' | 'bug' | 'featureRequest' | 'urgent';
export type FeatureId = string | null;
export interface IssueDetails {
	featureId: FeatureId;
	issueType: IssueType;
}
