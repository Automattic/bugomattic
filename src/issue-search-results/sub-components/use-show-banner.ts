import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import {
	selectIssueSearchRequestsWereMade,
	selectIssueSearchResultsRequestStatus,
} from '../issue-search-results-slice';

export function useShowBanner() {
	const resultsRequestStatus = useAppSelector( selectIssueSearchResultsRequestStatus );
	const requestsWereMade = useAppSelector( selectIssueSearchRequestsWereMade );

	// We want to handle the case when we come back to the issue searching page.
	// Since this is local state, we want to tie it back to the redux state.
	const [ showBanner, setShowBanner ] = useState( requestsWereMade );

	useEffect( () => {
		if (
			requestsWereMade &&
			( resultsRequestStatus === 'fulfilled' || resultsRequestStatus === 'error' )
		) {
			setShowBanner( true );
		}
	}, [ requestsWereMade, resultsRequestStatus ] );

	return showBanner;
}
