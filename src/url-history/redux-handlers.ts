import { Middleware } from 'redux';
import history from 'history/browser';
import { AppDispatch, RootState } from '../app/store';
import { updateHistoryWithState, updateStateFromHistory } from './actions';
import { queryToState, stateToQuery } from './parsers';

export const urlHistoryMiddleware: Middleware< {}, RootState > =
	( store ) => ( next ) => ( action ) => {
		if ( action.type !== updateHistoryWithState.type ) {
			return next( action );
		}

		const result = next( action );
		const newState = store.getState();

		const currentStateQuery = history.location.search;
		const newStateQuery = stateToQuery( newState );

		// We only want to push a state query history entry if it's new.
		// Otherwise, navigating back can feel like it does nothing.
		if ( currentStateQuery !== newStateQuery ) {
			history.push( `?${ newStateQuery }` );
		}

		return result;
	};

export function registerHistoryListener( dispatch: AppDispatch ) {
	history.listen( ( { location, action } ) => {
		if ( action === 'PUSH' ) {
			// Acting on PUSHes are pointless -- we're the ones triggering them!
			return;
		}
		const stateParams = location.search;
		const stateFromParams = queryToState( stateParams );
		dispatch( updateStateFromHistory( stateFromParams ) );
	} );
}
