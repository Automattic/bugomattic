import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectIssueSearchTerm, setSearchTerm } from '../issue-search-slice';
import { DebouncedSearch } from '../../common/components';
import { updateHistoryWithState } from '../../url-history/actions';
import { useMonitoring } from '../../monitoring/monitoring-provider';

export function IssueSearchInput() {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const reduxSearchTerm = useAppSelector( selectIssueSearchTerm );
	const [ inputSearchTerm, setInputSearchTerm ] = useState( reduxSearchTerm );

	// This is the main reason why we are controlling the local input state here, rather than
	// leaving it as "uncontrolled" (contained in the DebouncedSearch component).
	// We want to keep the value of the input in sync with the redux state, mostly for changes that come
	// from URL history changes.
	useEffect( () => {
		setInputSearchTerm( reduxSearchTerm );
	}, [ reduxSearchTerm ] );

	// Because this is passed as object, it's essential to memoize to prevent unnecessary re-renders.
	const controlledInputState = useMemo( () => {
		return {
			searchTerm: inputSearchTerm,
			setSearchTerm: setInputSearchTerm,
		};
	}, [ inputSearchTerm ] );

	// This callback must be memoized for the debouncing to work!
	const handleSearchTermEmitted = useCallback(
		( searchTerm: string ) => {
			dispatch( setSearchTerm( searchTerm ) );
			dispatch( updateHistoryWithState() );

			monitoringClient.analytics.recordEvent( 'issue_search', { searchTerm } );
		},
		[ dispatch, monitoringClient.analytics ]
	);

	return (
		<DebouncedSearch
			placeholder="Search for existing issues"
			inputAriaLabel="Search for existing issues"
			callback={ handleSearchTermEmitted }
			controlledInputState={ controlledInputState }
			debounceMs={ 500 }
			debounceCharacterMinimum={ 3 }
		/>
	);
}
