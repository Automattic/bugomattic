import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectDuplicateSearchTerm } from '../../duplicate-search/duplicate-search-slice';
import { selectDuplicateResultsRequestStatus } from '../duplicate-results-slice';

export function useSetHeightAfterRequest() {
	const searchTerm = useAppSelector( selectDuplicateSearchTerm );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	// This ref and corresponding useEffect hook are used to preserve the height of the
	// results container between searches. This keeps the UI from jumping around while searching.
	const resultsContainerContentRef = useRef< HTMLDivElement >( null );
	const [ resultsContainerContentHeightPx, setResultsContainerContentHeightPx ] = useState<
		number | undefined
	>( undefined );

	useEffect( () => {
		if (
			resultsRequestStatus === 'fulfilled' ||
			resultsRequestStatus === 'error' ||
			searchTerm === ''
		) {
			const newHeight = resultsContainerContentRef.current?.clientHeight;
			setResultsContainerContentHeightPx( newHeight );
		}
	}, [ resultsRequestStatus, searchTerm ] );

	return { resultsContainerContentRef, resultsContainerContentHeightPx };
}
