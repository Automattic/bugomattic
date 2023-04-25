import { AnyAction, Middleware } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { selectNormalizedReportingConfig } from './reporting-config/reporting-config-slice';
import { selectAvailableRepoFilters } from './available-repo-filters/available-repo-filters-slice';

/**
 * This middleware adds a pointer to the app's static data (e.g. reporting config, repo filters) to all actions' meta.
 * For simplicity now, we've opted to keep the static in the redux store, rather than in a separate context, or using React Query.
 * However, our "duck" pattern for redux slices means that we often can't access the static data in reducers.
 * This middleware solves that, so if any validation needs to happen based on that static data, it can.
 */
export const surfaceStaticDataMiddleware: Middleware< {}, RootState > =
	( store ) => ( next ) => ( action: AnyAction ) => {
		const state = store.getState();
		const reportingConfig = selectNormalizedReportingConfig( state );
		const availableRepoFilters = selectAvailableRepoFilters( state );

		action = {
			...action,
			meta: {
				...action.meta,
				reportingConfig,
				availableRepoFilters,
			},
		};

		return next( action );
	};
