import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatusFilter, setSearchParam, setStatusFilter } from '../duplicate-search-slice';
import { IssueStatusFilter } from '../types';
import styles from '../duplicate-search-controls.module.css';

export function StatusFilter() {
	const dispatch = useAppDispatch();
	const currentStatusFilter = useAppSelector( selectStatusFilter );

	const createId = ( statusFilter: IssueStatusFilter ) => `status-filter-${ statusFilter }`;

	const createDisplayText = ( statusFilter: IssueStatusFilter ) =>
		statusFilter.charAt( 0 ).toUpperCase() + statusFilter.slice( 1 );

	const createClickHandler = ( selectedStatusFilter: IssueStatusFilter ) => () => {
		if ( selectedStatusFilter !== currentStatusFilter ) {
			dispatch( setSearchParam( setStatusFilter( selectedStatusFilter ) ) );
		}
	};

	const currentStatusFilterOptions: IssueStatusFilter[] = [ 'all', 'open', 'closed' ];

	return (
		<div
			aria-label="Issue status filter"
			role="listbox"
			aria-activedescendant={ createId( currentStatusFilter ) }
			className={ styles.statusFilterControl }
		>
			{ currentStatusFilterOptions.map( ( statusFilter ) => (
				<button
					id={ createId( statusFilter ) }
					key={ statusFilter }
					onClick={ createClickHandler( statusFilter ) }
					aria-selected={ currentStatusFilter === statusFilter }
					role="option"
					className={ styles.statusFilterOption }
				>
					{ createDisplayText( statusFilter ) }
				</button>
			) ) }
		</div>
	);
}
