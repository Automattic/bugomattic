import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { FeatureId } from '../issue-details/types';
import { startOver } from '../start-over/start-over-counter-slice';
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
			return {
				...state,
				selectedFeatureId: action.payload,
			};
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( startOver, () => {
			return {
				...initialState,
			};
		} );
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
