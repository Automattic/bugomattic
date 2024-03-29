export type IssueType = 'unset' | 'bug' | 'feature-request' | 'urgent';
export type FeatureId = string | null;
export interface IssueDetails {
	featureId: FeatureId;
	issueType: IssueType;
	issueTitle: string;
}
