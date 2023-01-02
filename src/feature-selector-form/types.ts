import { FeatureId } from '../issue-details';

// Normally I wouldn't include "state" in the type name
// but here I think it's the most descriptive way to capture the idea of redux form state.
export interface FeatureSelectorFormState {
	searchTerm: string;
	selectedFeatureId: FeatureId;
}
