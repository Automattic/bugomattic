import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

export const startOverCounterSlice = createSlice( {
	name: 'startOverCounter',
	initialState: 0,
	reducers: {
		startOver( state ) {
			return state + 1;
		},
	},
} );

export const startOverCounterReducer = startOverCounterSlice.reducer;
export const { startOver } = startOverCounterSlice.actions;

export function selectStartOverCounter( state: RootState ) {
	return state.startOverCounter;
}
