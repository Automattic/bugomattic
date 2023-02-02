import {
	configureStore,
	ThunkAction,
	Action,
	combineReducers,
	PreloadedState,
} from '@reduxjs/toolkit';
import { ApiClient } from '../api/types';
import { reportingConfigReducer } from '../reporting-config/reporting-config-slice';
import { featureSelectorFormReducer } from '../feature-selector-form/feature-selector-form-slice';
import { issueDetailsReducer } from '../issue-details/issue-details-slice';
import { completedTasksReducer } from '../next-steps/completed-tasks-slice';
import { activeStepReducer } from '../reporting-flow/active-step-slice';
import {
	getInitialStateFromHistory,
	urlHistoryMiddleware,
	registerHistoryListener,
} from '../url-history/redux-handlers';

function createRootReducer() {
	return combineReducers( {
		reportingConfig: reportingConfigReducer,
		issueDetails: issueDetailsReducer,
		completedTasks: completedTasksReducer,
		featureSelectorForm: featureSelectorFormReducer,
		activeStep: activeStepReducer,
	} );
}

export function setupStore( apiClient: ApiClient, preloadedState?: PreloadedState< RootState > ) {
	if ( ! preloadedState ) {
		preloadedState = getInitialStateFromHistory();
	}

	const store = configureStore( {
		reducer: createRootReducer(),
		// This is where the app dependency injection of the ApiClient happens.
		// We are providing an instance of the ApiClient to all thunks created
		// with createAsyncThunk().
		// More info: https://redux.js.org/usage/writing-logic-thunks#injecting-config-values-into-thunks
		middleware: ( getDefaultMiddleware ) =>
			getDefaultMiddleware( {
				thunk: {
					extraArgument: { apiClient },
				},
			} ).concat( urlHistoryMiddleware ),
		preloadedState,
	} );

	registerHistoryListener( store.dispatch );

	return store;
}

// These provide richer TypeScript typings for these core parts of the Redux store.
export type RootState = ReturnType< ReturnType< typeof createRootReducer > >;
export type AppStore = ReturnType< typeof setupStore >;
export type AppDispatch = AppStore[ 'dispatch' ];
export type AppThunk< ReturnType = void > = ThunkAction<
	ReturnType,
	RootState,
	ApiClient,
	Action< string >
>;
