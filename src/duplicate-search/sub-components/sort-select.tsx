import React, { useCallback } from 'react';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '../../common/components';
import styles from '../duplicate-search-controls.module.css';
import { IssueSortOption } from '../types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSort, setSearchParam, setSort } from '../duplicate-search-slice';
import { ReactComponent as CheckIcon } from '../../common/svgs/check.svg';
import { ReactComponent as DownIcon } from '../../common/svgs/chevron-down.svg';
import { ReactComponent as SortIcon } from '../../common/svgs/sort.svg';

interface SortOptions {
	label: string;
	value: IssueSortOption;
}

export function SortSelect() {
	const dispatch = useAppDispatch();
	const currentSortOption = useAppSelector( selectSort );
	const sortOptions: SortOptions[] = [
		{
			label: 'Relevance (default)',
			value: 'relevance',
		},
		{
			label: 'Date added',
			value: 'date-created',
		},
	];

	let sortDropdownTriggerLabel = sortOptions.find(
		( sortOption ) => sortOption.value === currentSortOption
	)?.label;
	if ( ! sortDropdownTriggerLabel || sortDropdownTriggerLabel === 'Relevance (default)' ) {
		sortDropdownTriggerLabel = 'Sort';
	}

	const handleSortOptionClick = useCallback(
		( sortOptionValue: string ) => {
			dispatch( setSearchParam( setSort( sortOptionValue as IssueSortOption ) ) );
		},
		[ dispatch ]
	);

	return (
		<Dropdown placement="bottom-end" role="listbox">
			<DropdownTrigger aria-label="Sort results by…">
				<button className={ styles.dropdownButton }>
					<SortIcon aria-hidden={ true } className={ styles.inlineIcon } />
					<span>{ sortDropdownTriggerLabel }</span>
					<DownIcon aria-hidden={ true } className={ styles.inlineIcon } />
				</button>
			</DropdownTrigger>
			<DropdownContent aria-label="Sort options">
				{ sortOptions.map( ( sortOption ) => (
					<DropdownItem
						key={ sortOption.value }
						role="option"
						label={ sortOption.label }
						aria-selected={ currentSortOption === sortOption.value }
						className={ styles.sortOption }
						onClick={ () => handleSortOptionClick( sortOption.value ) }
					>
						<span className={ styles.sortCheckIconWrapper }>
							{ currentSortOption === sortOption.value && (
								<CheckIcon aria-hidden="true" className={ styles.sortCheckIcon } />
							) }
						</span>
						<span className={ styles.sortOptionLabelWrapper }>{ sortOption.label }</span>
					</DropdownItem>
				) ) }
			</DropdownContent>
		</Dropdown>
	);
}
