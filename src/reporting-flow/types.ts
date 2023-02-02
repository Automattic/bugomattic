import { FeatureId, IssueType } from '../issue-details/types';

export type ActiveStep = 'titleAndType' | 'featureSelection' | 'nextSteps';

export interface CompleteFeatureSelectionStepPayload {
	nextStep?: ActiveStep;
	featureId: FeatureId;
}

export interface CompleteTitleAndTypeStepPayload {
	nextStep?: ActiveStep;
	title: string;
	type: IssueType;
}
