import { EmptyObject } from 'redux';
import { RootState } from '../app/store';
import qs from 'qs';

// Redux includes this weird readonly symbol iterator on the RootState type.
// That's not a real key, so we need to strip it here.
type KeyableRootState = Omit< RootState, keyof EmptyObject >;

// If you want any redux state to be tracked in the URL, add the top level key here.
// The order they are in is the order they will appear in the URL
const trackedStateKeys: ( keyof KeyableRootState )[] = [
	'activePage',
	'activeReportingStep',
	'duplicateSearch',
	'issueDetails',
	'completedTasks',
];

export function stateToQuery( state: RootState ) {
	// For some reason, TypeScript doesn't like how we're copying keys over.
	// We are still safe because the keys are typed, and we're just stringifying anyway!
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const stateToSerialize: any = {};
	for ( const key of trackedStateKeys ) {
		stateToSerialize[ key ] = state[ key ];
	}
	const query = qs.stringify( stateToSerialize, {
		filter( prefix, value ) {
			if ( isFalsyOrEmpty( value ) ) {
				return;
			}

			if ( defaultStateValues[ prefix ] === value ) {
				return;
			}

			return value;
		},
	} );

	return query;
}

function isFalsyOrEmpty( value: unknown ) {
	return ! value || ( Array.isArray( value ) && value.length === 0 );
}

const defaultStateValues: { [ key: string ]: string } = {
	'duplicateSearch[statusFilter]': 'all',
	'duplicateSearch[sort]': 'relevance',
	'issueDetails[issueType]': 'unset',
};

export function queryToState( query: string ): Partial< RootState > {
	const queryObject = qs.parse( query, {
		ignoreQueryPrefix: true,
		// Adding the ability to store and read booleans/nulls/undefineds.
		// For now, we'll parse numbers as strings. We don't really use numbers in our state.
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
	// That keeps this parser dynamic and flexible to new keys without modification.
	// That helps keep with the "Open Closed Principle."
	for ( const key of trackedStateKeys ) {
		// We do the validation later, so we just cast to any here.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		state[ key ] = queryObject[ key ] as any;
	}

	return state;
}
