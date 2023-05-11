import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { searchIssues, selectDuplicateSearchParams } from '../duplicate-search-slice';

/**
 * A hook that establishes a "reactive" searching approach. Anytime search parameters change,
 * we fire a new search.
 *
 * Why a reactive approach instead of an imperative approach (i.e., dispatch on a button click)?
 * Because the search params can be changed by outside actions, namely browser history navigation!
 * We still want to search in that case.
 */
export function useSearchIssuesOnParamChange() {
	const dispatch = useAppDispatch();
	const searchParams = useAppSelector( selectDuplicateSearchParams );

	useEffect( () => {
		if ( searchParams.searchTerm.trim() !== '' ) {
			dispatch( searchIssues() );
		}
	}, [ searchParams, dispatch ] );
}
