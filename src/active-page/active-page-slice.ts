import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { updateStateFromHistory } from '../url-history/actions';
import { ActivePage } from './types';

const initialState: ActivePage = 'search-issues' as ActivePage;

const validActivePages = new Set< ActivePage >( [ 'search-issues', 'report-issue' ] );

export const activePageSlice = createSlice( {
	name: 'activePage',
	initialState,
	reducers: {
		setActivePage( _state, action: PayloadAction< ActivePage > ) {
			return action.payload;
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( updateStateFromHistory, ( _state, action ) => {
			const activePage = action.payload.activePage;
			if ( ! activePage ) {
				return initialState;
			}

			if ( ! validActivePages.has( activePage ) ) {
				return initialState;
			}

			return activePage;
		} );
	},
} );

export const activePageReducer = activePageSlice.reducer;
export const { setActivePage } = activePageSlice.actions;

export function selectActivePage( state: RootState ) {
	return state.activePage;
}
