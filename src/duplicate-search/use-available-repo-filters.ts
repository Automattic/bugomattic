import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
	loadAvailableRepoFilters,
	selectAvailableRepoFiltersRequestError,
	selectAvailableRepoFiltersRequestStatus,
} from './duplicate-search-slice';

export function useAvailableRepoFiltersLoad() {
	const dispatch = useAppDispatch();

	const loadStatus = useAppSelector( selectAvailableRepoFiltersRequestStatus );
	const error = useAppSelector( selectAvailableRepoFiltersRequestError );

	useEffect( () => {
		if ( loadStatus === 'empty' ) {
			dispatch( loadAvailableRepoFilters() );
		}

		dispatch( loadAvailableRepoFilters() );
	}, [ dispatch, loadStatus ] );

	return { loadStatus, error };
}
