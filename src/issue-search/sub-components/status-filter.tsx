import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatusFilter, setStatusFilter } from '../issue-search-slice';
import { IssueStatusFilter } from '../types';
import { SegmentedControl } from '../../common/components';
import { updateHistoryWithState } from '../../url-history/actions';
import { useMonitoring } from '../../monitoring/monitoring-provider';

export function StatusFilter() {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const currentStatusFilter = useAppSelector( selectStatusFilter );

	const statusFilterOptions: { value: IssueStatusFilter; displayText: string }[] = [
		{ value: 'all', displayText: 'All' },
		{ value: 'open', displayText: 'Open' },
		{ value: 'closed', displayText: 'Closed' },
	];

	const onStatusFilterSelect = useCallback(
		( newStatusFilter: IssueStatusFilter ) => {
			dispatch( setStatusFilter( newStatusFilter ) );
			dispatch( updateHistoryWithState() );

			monitoringClient.analytics.recordEvent( 'status_filter_select', {
				status_filter: newStatusFilter,
			} );
		},
		[ dispatch, monitoringClient.analytics ]
	);

	return (
		<SegmentedControl
			options={ statusFilterOptions }
			selectedOption={ currentStatusFilter }
			onSelect={ onStatusFilterSelect as ( value: string ) => void }
			controlId="status-filter"
			ariaLabel="Issue status filter"
		/>
	);
}
