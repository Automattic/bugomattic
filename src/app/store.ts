import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { ApiClient } from '../api';
import { reportingConfigReducer } from '../reporting-config';

export function createStore( apiClient: ApiClient ) {
	return configureStore( {
		reducer: {
			reportingConfig: reportingConfigReducer,
		},
		// This is where the app dependency injection of the ApiClient happens.
		// We are providing an instance of the ApiClient to all thunks created
		// with createAsyncThunk().
		// More info: https://redux.js.org/usage/writing-logic-thunks#injecting-config-values-into-thunks
		middleware: ( getDefaultMiddleware ) =>
			getDefaultMiddleware( {
				thunk: {
					extraArgument: { apiClient },
				},
			} ),
	} );
}

type AppStore = ReturnType< typeof createStore >;
export type AppDispatch = AppStore[ 'dispatch' ];
export type RootState = ReturnType< AppStore[ 'getState' ] >;
export type AppThunk< ReturnType = void > = ThunkAction<
	ReturnType,
	RootState,
	ApiClient,
	Action< string >
>;
