import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { updateStateFromHistory } from '../url-history/actions';
import { ActiveStep } from './types';

const initialState: ActiveStep = 'featureSelection' as ActiveStep;

const validActiveSteps = new Set< ActiveStep >( [ 'featureSelection', 'typeTitle', 'nextSteps' ] );

export const featureSelectorFormSlice = createSlice( {
	name: 'activeStep',
	initialState: initialState,
	reducers: {
		setActiveStep( _state, action: PayloadAction< ActiveStep > ) {
			return action.payload;
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( updateStateFromHistory, ( state, action ) => {
			const activeStep = action.payload.activeStep;
			if ( ! activeStep ) {
				return initialState;
			}

			if ( ! validActiveSteps.has( activeStep ) ) {
				return initialState;
			}

			return action.payload.activeStep;
		} );
	},
} );

export const activeStepReducer = featureSelectorFormSlice.reducer;
export const { setActiveStep } = featureSelectorFormSlice.actions;

export function selectActiveStep( state: RootState ) {
	return state.activeStep;
}
