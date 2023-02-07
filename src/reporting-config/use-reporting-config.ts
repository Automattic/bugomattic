import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
	loadReportingConfig,
	selectReportingConfigError,
	selectReportingConfigLoadStatus,
} from './reporting-config-slice';
import { useEffect } from 'react';

export function useReportingConfigLoad() {
	const dispatch = useAppDispatch();

	const loadStatus = useAppSelector( selectReportingConfigLoadStatus );
	const error = useAppSelector( selectReportingConfigError );

	useEffect( () => {
		if ( loadStatus === 'empty' ) {
			dispatch( loadReportingConfig() );
		}
	}, [ loadStatus, dispatch ] );

	return { loadStatus, error };
}
