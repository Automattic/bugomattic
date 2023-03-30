import {
	configureStore,
	ThunkAction,
	Action,
	combineReducers,
	PreloadedState,
} from '@reduxjs/toolkit';
import { ApiClient } from '../api/types';
import { reportingConfigReducer } from '../static-data/reporting-config/reporting-config-slice';
import { featureSelectorFormReducer } from '../feature-selector-form/feature-selector-form-slice';
import { issueDetailsReducer } from '../issue-details/issue-details-slice';
import { completedTasksReducer } from '../next-steps/completed-tasks-slice';
import { activeReportingStepReducer } from '../reporting-flow-page/active-reporting-step-slice';
import { urlHistoryMiddleware, registerHistoryListener } from '../url-history/redux-handlers';
import { startOverCounterReducer } from '../start-over/start-over-counter-slice';
import { duplicateSearchReducer } from '../duplicate-search/duplicate-search-slice';
import { duplicateResultsReducer } from '../duplicate-results/duplicate-results-slice';
import { activePageReducer } from '../active-page/active-page-slice';
import { availableRepoFiltersReducer } from '../static-data/available-repo-filters/available-repo-filters-slice';
import { surfaceStaticDataMiddleware } from '../static-data/static-data-middleware';

function createRootReducer() {
	return combineReducers( {
		reportingConfig: reportingConfigReducer,
		availableRepoFilters: availableRepoFiltersReducer,
		issueDetails: issueDetailsReducer,
		completedTasks: completedTasksReducer,
		featureSelectorForm: featureSelectorFormReducer,
		activeReportingStep: activeReportingStepReducer,
		startOverCounter: startOverCounterReducer,
		duplicateSearch: duplicateSearchReducer,
		duplicateResults: duplicateResultsReducer,
		activePage: activePageReducer,
	} );
}

export function setupStore( apiClient: ApiClient, preloadedState?: PreloadedState< RootState > ) {
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
			} ).concat( surfaceStaticDataMiddleware, urlHistoryMiddleware ),
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
	{ apiClient: ApiClient },
	Action< string >
>;
