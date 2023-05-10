import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
	selectDuplicateSearchTerm,
	setSearchParam,
	setSearchTerm,
} from '../duplicate-search-slice';
import { DebouncedSearch } from '../../common/components';

export function DuplicateSearchInput() {
	const dispatch = useAppDispatch();
	const reduxSearchTerm = useAppSelector( selectDuplicateSearchTerm );
	const [ inputSearchTerm, setInputSearchTerm ] = useState( reduxSearchTerm );

	const controlledInputState = useMemo( () => {
		return {
			searchTerm: inputSearchTerm,
			setSearchTerm: setInputSearchTerm,
		};
	}, [ inputSearchTerm ] );

	const handleSearchTermEmitted = ( searchTerm: string ) => {
		dispatch( setSearchParam( setSearchTerm( searchTerm ) ) );
	};

	useEffect( () => {
		setInputSearchTerm( reduxSearchTerm );
	}, [ reduxSearchTerm ] );

	return (
		<DebouncedSearch
			placeholder="Search for duplicate issues"
			inputAriaLabel="Search for duplicate issues"
			callback={ handleSearchTermEmitted }
			controlledInputState={ controlledInputState }
			debounceMs={ 500 }
			debounceCharacterMinimum={ 3 }
		/>
	);
}
