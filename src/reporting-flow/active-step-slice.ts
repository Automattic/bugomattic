import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { updateStateFromHistory } from '../url-history/actions';
import { ActiveStep } from './types';

const initialState: ActiveStep = 'featureSelection' as ActiveStep;

export const featureSelectorFormSlice = createSlice( {
	name: 'activeStep',
	initialState: initialState,
	reducers: {
		setActiveStep( state, action: PayloadAction< ActiveStep > ) {
			return action.payload;
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( updateStateFromHistory, ( _state, action ) => {
			return action.payload.activeStep;
		} );
	},
} );

export const activeStepReducer = featureSelectorFormSlice.reducer;
export const { setActiveStep } = featureSelectorFormSlice.actions;

export function selectActiveStep( state: RootState ) {
	return state.activeStep;
}
