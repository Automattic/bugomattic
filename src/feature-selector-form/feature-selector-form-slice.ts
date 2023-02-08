import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { FeatureId } from '../issue-details/types';
import { NormalizedReportingConfig } from '../reporting-config/types';
import { FeatureSelectorFormState } from './types';

const initialState: FeatureSelectorFormState = {
	searchTerm: '',
	selectedFeatureId: null,
};

export const featureSelectorFormSlice = createSlice( {
	name: 'featureSelectorForm',
	initialState: initialState,
	reducers: {
		setFeatureSearchTerm( state, action: PayloadAction< string > ) {
			return {
				...state,
				searchTerm: action.payload,
			};
		},
		setSelectedFeatureId( state, action: PayloadAction< FeatureId > ) {
			const actionWithReportingConfig = action as PayloadAction<
				FeatureId,
				string,
				NormalizedReportingConfig
			>;
			const { features } = actionWithReportingConfig.meta;

			let newSelectedFeatureId: FeatureId;
			if ( action.payload === null || features[ action.payload ] ) {
				newSelectedFeatureId = action.payload;
			} else {
				newSelectedFeatureId = state.selectedFeatureId;
			}

			return {
				...state,
				selectedFeatureId: newSelectedFeatureId,
			};
		},
	},
} );

export const featureSelectorFormReducer = featureSelectorFormSlice.reducer;
export const { setFeatureSearchTerm, setSelectedFeatureId } = featureSelectorFormSlice.actions;

export function selectFeatureSelectorFormState( state: RootState ): FeatureSelectorFormState {
	return state.featureSelectorForm;
}

export function selectFeatureSearchTerm( state: RootState ): string {
	return state.featureSelectorForm.searchTerm;
}

export function selectSelectedFeatureId( state: RootState ): FeatureId {
	return state.featureSelectorForm.selectedFeatureId;
}
