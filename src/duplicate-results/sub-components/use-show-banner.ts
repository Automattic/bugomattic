import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import {
	selectDuplicateRequestsWereMade,
	selectDuplicateResultsRequestStatus,
} from '../duplicate-results-slice';

export function useShowBanner() {
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const requestsWereMade = useAppSelector( selectDuplicateRequestsWereMade );

	// We want to handle the case when we come back to the duplicate searching page.
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
