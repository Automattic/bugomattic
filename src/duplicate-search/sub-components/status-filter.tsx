import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatusFilter, setSearchParam, setStatusFilter } from '../duplicate-search-slice';
import { IssueStatusFilter } from '../types';
import { SegmentedControl } from '../../common/components';

export function StatusFilter() {
	const dispatch = useAppDispatch();
	const currentStatusFilter = useAppSelector( selectStatusFilter );

	const statusFilterOptions: { value: IssueStatusFilter; displayText: string }[] = [
		{ value: 'all', displayText: 'All' },
		{ value: 'open', displayText: 'Open' },
		{ value: 'closed', displayText: 'Closed' },
	];

	const onStatusFilterSelect = useCallback(
		( newStatusFilter: IssueStatusFilter ) => {
			dispatch( setSearchParam( setStatusFilter( newStatusFilter ) ) );
		},
		[ dispatch ]
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
