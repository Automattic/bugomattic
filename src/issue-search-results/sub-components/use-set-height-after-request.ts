import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectIssueSearchTerm } from '../../issue-search/issue-search-slice';
import { selectIssueSearchResultsRequestStatus } from '../issue-search-results-slice';

export function useSetHeightAfterRequest() {
	const searchTerm = useAppSelector( selectIssueSearchTerm );
	const resultsRequestStatus = useAppSelector( selectIssueSearchResultsRequestStatus );
	// This ref and corresponding useEffect hook are used to preserve the height of the
	// results container between searches. This keeps the UI from jumping around while searching.
	const resultsContainerContentRef = useRef< HTMLDivElement >( null );
	const [ resultsContainerContentHeightPx, setResultsContainerContentHeightPx ] = useState<
		number | undefined
	>( undefined );

	useEffect( () => {
		if ( resultsRequestStatus === 'fulfilled' || resultsRequestStatus === 'error' ) {
			const newHeight = resultsContainerContentRef.current?.clientHeight;
			setResultsContainerContentHeightPx( newHeight );
		}
		// We dd searchTerm as a dependency to make sure the height is redrawn when the search term is empty,
		// because we don't actually trigger new search requests when the search term is empty.
	}, [ resultsRequestStatus, searchTerm ] );

	return { resultsContainerContentRef, resultsContainerContentHeightPx };
}
