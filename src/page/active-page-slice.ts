import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { ActivePage } from './types';

const initialState: ActivePage = 'duplicateSearching' as ActivePage;

export const activePageSlice = createSlice( {
	name: 'activePage',
	initialState,
	reducers: {
		setActivePage( _state, action: PayloadAction< ActivePage > ) {
			return action.payload;
		},
	},
} );

export const activePageReducer = activePageSlice.reducer;
export const { setActivePage } = activePageSlice.actions;

export function selectActivePage( state: RootState ) {
	return state.activePage;
}
