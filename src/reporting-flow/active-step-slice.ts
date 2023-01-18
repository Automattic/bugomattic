import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { ActiveStep } from './types';

const initialState: ActiveStep = 'titleAndType' as ActiveStep;

export const featureSelectorFormSlice = createSlice( {
	name: 'activeStep',
	initialState: initialState,
	reducers: {
		setActiveStep( state, action: PayloadAction< ActiveStep > ) {
			return action.payload;
		},
	},
} );

export const activeStepReducer = featureSelectorFormSlice.reducer;
export const { setActiveStep } = featureSelectorFormSlice.actions;

export function selectActiveStep( state: RootState ) {
	return state.activeStep;
}
