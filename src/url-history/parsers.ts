import { EmptyObject } from 'redux';
import { RootState } from '../app/store';
import qs from 'qs';

type KeyableRootState = Omit< RootState, keyof EmptyObject >;

// If you want any redux state to be tracked in the URL, add the top level key here.
const trackedStateKeys: ( keyof KeyableRootState )[] = [
	'issueDetails',
	'activeStep',
	'completedTasks',
];

export function stateToQuery( state: RootState ) {
	const stateToSerialize: RootState = {} as RootState;
	for ( const key of trackedStateKeys ) {
		// TODO: we can fix this typing, I swear!
		stateToSerialize[ key ] = state[ key ] as any;
	}
	const query = qs.stringify( stateToSerialize );

	return query;
}

export function queryToState( query: string ): Partial< RootState > {
	const queryObject = qs.parse( query, {
		ignoreQueryPrefix: true,
		// Adding the ability to store and read booleans/nulls/undefineds.
		// See discussion here: https://github.com/ljharb/qs/issues/91
		decoder( value ) {
			const keywords = {
				true: true,
				false: false,
				null: null,
				undefined: undefined,
			};
			if ( value in keywords ) {
				return keywords[ value as keyof typeof keywords ];
			}

			// This is extra hedging in case someone manually edits the URL and uses pluses.
			const valueWithoutPlus = value.replace( /\+/g, ' ' );

			try {
				return decodeURIComponent( valueWithoutPlus );
			} catch {
				return valueWithoutPlus;
			}
		},
	} );

	const state: Partial< RootState > = {};
	// We only copy the keys we are tracking to be safe.
	// But we defer the actual validation and fallback values to the reducer.
	// That helps keep with the "Open Closed Principle."
	for ( const key of trackedStateKeys ) {
		// TODO: can we cast the type here properly
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		state[ key ] = queryObject[ key ] as any;
	}

	return state;
}
