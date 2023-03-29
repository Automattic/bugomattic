import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { startOver } from '../start-over/start-over-counter-slice';
import { updateStateFromHistory } from '../url-history/actions';
import { ActiveReportingStep } from './types';

const initialState: ActiveReportingStep = 'featureSelection' as ActiveReportingStep;

const validActiveReportingSteps = new Set< ActiveReportingStep >( [
	'featureSelection',
	'typeTitle',
	'nextSteps',
] );

export const activeReportingStepSlice = createSlice( {
	name: 'activeReportingStep',
	initialState: initialState,
	reducers: {
		setActiveReportingStep( _state, action: PayloadAction< ActiveReportingStep > ) {
			return action.payload;
		},
	},
	extraReducers: ( builder ) => {
		builder
			.addCase( updateStateFromHistory, ( _state, action ) => {
				const activeReportingStep = action.payload.activeReportingStep;
				if ( ! activeReportingStep ) {
					return initialState;
				}

				if ( ! validActiveReportingSteps.has( activeReportingStep ) ) {
					return initialState;
				}

				return action.payload.activeReportingStep;
			} )
			.addCase( startOver, () => initialState );
	},
} );

export const activeReportingStepReducer = activeReportingStepSlice.reducer;
export const { setActiveReportingStep } = activeReportingStepSlice.actions;

export function selectActiveReportingStep( state: RootState ) {
	return state.activeReportingStep;
}
