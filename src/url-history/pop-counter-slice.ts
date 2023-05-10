import { createSlice } from '@reduxjs/toolkit';
import { updateStateFromHistory } from './actions';
import { RootState } from '../app/store';

export const urlHistoryPopCounterSlice = createSlice( {
	name: 'urlHistoryPopCounter',
	initialState: 0,
	reducers: {},
	extraReducers: ( builder ) => {
		builder.addCase( updateStateFromHistory, ( state ) => state + 1 );
	},
} );

export const urlHistoryPopCounterReducer = urlHistoryPopCounterSlice.reducer;

export function selectUrlHistoryPopCounter( state: RootState ) {
	return state.startOverCounter;
}
