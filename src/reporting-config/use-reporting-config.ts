import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loadReportingConfig, selectReportingConfigLoadStatus } from './reporting-config-slice';
import { useEffect } from 'react';

export function useReportingConfigLoad() {
	const dispatch = useAppDispatch();

	const reportingConfigLoadStatus = useAppSelector( selectReportingConfigLoadStatus );

	useEffect( () => {
		if ( reportingConfigLoadStatus === 'empty' ) {
			dispatch( loadReportingConfig() );
		}
	}, [ reportingConfigLoadStatus, dispatch ] );

	return reportingConfigLoadStatus;
}
