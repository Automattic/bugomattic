import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectStatusFilter, setSearchParam, setStatusFilter } from '../duplicate-search-slice';
import { IssueStatusFilter } from '../types';
import styles from '../duplicate-search-controls.module.css';

export function StatusFilter() {
	const dispatch = useAppDispatch();
	const currentStatusFilter = useAppSelector( selectStatusFilter );

	const allId = 'status-filter-all';
	const openId = 'status-filter-open';
	const closedId = 'status-filter-closed';

	let activeId: string;
	switch ( currentStatusFilter ) {
		case 'open':
			activeId = openId;
			break;
		case 'closed':
			activeId = closedId;
			break;
		case 'all':
		default:
			activeId = allId;
			break;
	}

	const createClickHandler = ( selectedStatusFilter: IssueStatusFilter ) => () => {
		if ( selectedStatusFilter !== currentStatusFilter ) {
			dispatch( setSearchParam( setStatusFilter( selectedStatusFilter ) ) );
		}
	};

	return (
		<div
			aria-label="Issue status filter"
			role="listbox"
			aria-activedescendant={ activeId }
			className={ styles.statusFilterControl }
		>
			<button
				id={ allId }
				onClick={ createClickHandler( 'all' ) }
				aria-selected={ currentStatusFilter === 'all' }
				role="option"
				className={ styles.statusFilterOption }
			>
				All
			</button>
			<button
				id={ openId }
				onClick={ createClickHandler( 'open' ) }
				aria-selected={ currentStatusFilter === 'open' }
				role="option"
				className={ styles.statusFilterOption }
			>
				Open
			</button>
			<button
				id={ closedId }
				onClick={ createClickHandler( 'closed' ) }
				aria-selected={ currentStatusFilter === 'closed' }
				role="option"
				className={ styles.statusFilterOption }
			>
				Closed
			</button>
		</div>
	);
}
