import { Middleware } from 'redux';
import history from 'history/browser';
import { AppDispatch, RootState } from '../app/store';
import { setActiveStep } from '../reporting-flow/active-step-slice';
import { addCompletedTask, removeCompletedTask } from '../next-steps/completed-tasks-slice';
import { UrlTrackedState } from './types';
import { ActiveStep } from '../reporting-flow/types';
import { IssueType } from '../issue-details/types';
import {
	completeFeatureSelectionStep,
	completeTitleAndTypeStep,
} from '../reporting-flow/navigation-actions';
import { updateStateFromHistory } from './actions';

export const urlHistoryMiddleware: Middleware< {}, RootState > =
	( store ) => ( next ) => ( action ) => {
		const previousState = store.getState();
		const result = next( action );
		const newState = store.getState();

		const actionAllowList: Set< string > = new Set( [
			completeFeatureSelectionStep.type,
			completeTitleAndTypeStep.type,
			setActiveStep.type,
			addCompletedTask.type,
			removeCompletedTask.type,
		] );

		if ( ! actionAllowList.has( action.type ) ) {
			return result;
		}

		const previousStateQuery = stateToQuery( previousState );
		const newStateQuery = stateToQuery( newState );

		if ( previousStateQuery === newStateQuery ) {
			return result;
		}

		history.push( `?${ newStateQuery }` );

		return result;
	};

export function registerHistoryListener( dispatch: AppDispatch ) {
	history.listen( ( { location } ) => {
		const stateParams = location.search;
		const stateFromParams = queryToState( stateParams );
		dispatch( updateStateFromHistory( stateFromParams ) );
	} );
}

export function getInitialStateFromHistory(): UrlTrackedState {
	const stateParams = history.location.search;
	return queryToState( stateParams );
}

function stateToQuery( state: RootState ) {
	const { issueDetails, activeStep, completedTasks } = state;
	const { issueTitle, issueType, featureId } = issueDetails;
	const query = new URLSearchParams();

	query.set( 'activeStep', activeStep );

	if ( issueTitle ) {
		query.set( 'issueTitle', issueTitle );
	}

	if ( issueType !== 'unset' ) {
		query.set( 'issueType', issueType );
	}

	if ( featureId ) {
		query.set( 'issueFeatureId', featureId );
	}

	if ( completedTasks && completedTasks.length > 0 ) {
		for ( const completedTask of completedTasks ) {
			query.append( 'completedTasks', completedTask );
		}
	}

	return query.toString();
}

function queryToState( query: string ): UrlTrackedState {
	const queryParams = new URLSearchParams( query );
	const activeStep = queryParams.get( 'activeStep' );
	const issueTitle = queryParams.get( 'issueTitle' );
	const issueType = queryParams.get( 'issueType' );
	const featureId = queryParams.get( 'issueFeatureId' );
	const completedTasks = queryParams.getAll( 'completedTasks' );

	const state: UrlTrackedState = {
		activeStep: activeStep ? ( activeStep as ActiveStep ) : 'featureSelection',
		issueDetails: {
			issueTitle: issueTitle ? issueTitle : '',
			issueType: issueType ? ( issueType as IssueType ) : 'unset',
			featureId: featureId ? featureId : null,
		},
		completedTasks: completedTasks && completedTasks.length > 0 ? completedTasks : [],
	};

	return state;
}
