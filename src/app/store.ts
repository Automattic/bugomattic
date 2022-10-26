import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { reportingConfigReducer } from '../reporting-config';

export const store = configureStore( {
	reducer: {
		reportingConfig: reportingConfigReducer,
	},
} );

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType< typeof store.getState >;
export type AppThunk< ReturnType = void > = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action< string >
>;
