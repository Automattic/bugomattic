import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../app/hooks';
import {
	selectDuplicateRequestsWereMade,
	selectDuplicateResultsRequestStatus,
} from '../duplicate-results-slice';

export function useShowBanner() {
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const requestsWereMade = useAppSelector( selectDuplicateRequestsWereMade );

	const showBannerRef = useRef( false );

	useEffect( () => {
		if (
			requestsWereMade &&
			( resultsRequestStatus === 'fulfilled' || resultsRequestStatus === 'error' )
		) {
			showBannerRef.current = true;
		}
	}, [ requestsWereMade, resultsRequestStatus ] );

	return showBannerRef.current;
}
