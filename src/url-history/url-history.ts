import { Middleware } from 'redux';
import history from 'history/browser';
import { AppDispatch, RootState } from '../app/store';
import {
	setIssueType,
	setIssueFeatureId,
	setIssueTitle,
} from '../issue-details/issue-details-slice';
import { setActiveStep } from '../reporting-flow/active-step-slice';
import { addCompletedTask, removeCompletedTask } from '../next-steps/completed-tasks-slice';
import { UrlTrackedState } from './types';
import { ActiveStep } from '../reporting-flow/types';
import { IssueType } from '../issue-details/types';

export const urlHistoryMiddleware: Middleware< {}, RootState > =
	( store ) => ( next ) => ( action ) => {
		const previousState = store.getState();
		const result = next( action );
		const newState = store.getState();

		const actionAllowlist: Set< string > = new Set( [
			setActiveStep.type,
			setIssueFeatureId.type,
			setIssueType.type,
			setIssueTitle.type,
			addCompletedTask.type,
			removeCompletedTask.type,
		] );

		if ( ! actionAllowlist.has( action.type ) ) {
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

export function registerHistoryListener( dispatch: AppDispatch, getState: () => RootState ) {
	history.listen( ( { location, action } ) => {
		if ( action === 'PUSH' ) {
			return;
		}

		const stateParams = location.search;
		const oldState = getState();
		const newState = queryToState( stateParams );
		updateState( oldState, newState, dispatch );
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

function updateState( oldState: RootState, newState: UrlTrackedState, dispatch: AppDispatch ) {
	if ( newState.activeStep !== oldState.activeStep ) {
		dispatch( setActiveStep( newState.activeStep ) );
	}

	if ( newState.issueDetails.featureId !== oldState.issueDetails.featureId ) {
		dispatch( setIssueFeatureId( newState.issueDetails.featureId ) );
	}

	if ( newState.issueDetails.issueTitle !== oldState.issueDetails.issueTitle ) {
		dispatch( setIssueTitle( newState.issueDetails.issueTitle ) );
	}

	if ( newState.issueDetails.issueType !== oldState.issueDetails.issueType ) {
		dispatch( setIssueType( newState.issueDetails.issueType ) );
	}

	// TODO: use Sets to make more efficient
	if ( ! arrayValuesAreEqual( newState.completedTasks, oldState.completedTasks ) ) {
		for ( const newCompletedTask of newState.completedTasks ) {
			if ( ! oldState.completedTasks.includes( newCompletedTask ) ) {
				dispatch( addCompletedTask( newCompletedTask ) );
			}
		}

		for ( const oldCompletedTask of oldState.completedTasks ) {
			if ( ! newState.completedTasks.includes( oldCompletedTask ) ) {
				dispatch( removeCompletedTask( oldCompletedTask ) );
			}
		}
	}
}

function arrayValuesAreEqual( array1: string[], array2: string[] ) {
	if ( array1.length !== array2.length ) {
		return false;
	}

	return array1.every( ( value ) => array2.includes( value ) );
}
