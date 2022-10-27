import {
	configureStore,
	ThunkAction,
	Action,
	combineReducers,
	PreloadedState,
} from '@reduxjs/toolkit';
import { activeTasksReducer } from '../active-tasks';
import { ApiClient } from '../api';
import { issueDetailsReducer } from '../issue-details';
import { reportingConfigReducer } from '../reporting-config';

const rootReducer = combineReducers( {
	reportingConfig: reportingConfigReducer,
	issueDetails: issueDetailsReducer,
	activeTasks: activeTasksReducer,
} );

export function setupStore( apiClient: ApiClient, preloadedState?: PreloadedState< RootState > ) {
	return configureStore( {
		reducer: rootReducer,
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
		preloadedState,
	} );
}

// These provide richer TypeScript typings for these core parts of the Redux store.
export type RootState = ReturnType< typeof rootReducer >;
export type AppStore = ReturnType< typeof setupStore >;
export type AppDispatch = AppStore[ 'dispatch' ];
export type AppThunk< ReturnType = void > = ThunkAction<
	ReturnType,
	RootState,
	ApiClient,
	Action< string >
>;
