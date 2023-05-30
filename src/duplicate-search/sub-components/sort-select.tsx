import React, { useCallback, useEffect, useState } from 'react';
import {
	Dropdown,
	DropdownContent,
	DropdownItem,
	DropdownTrigger,
	OutlineNeutralButton,
} from '../../common/components';
import styles from '../duplicate-search-controls.module.css';
import { IssueSortOption } from '../types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSort, setSort } from '../duplicate-search-slice';
import { ReactComponent as CheckIcon } from '../../common/svgs/check.svg';
import { ReactComponent as DownIcon } from '../../common/svgs/chevron-down.svg';
import { ReactComponent as SortIcon } from '../../common/svgs/sort.svg';
import { Placement } from '@floating-ui/react';
import { updateHistoryWithState } from '../../url-history/actions';

interface SortOptions {
	label: string;
	value: IssueSortOption;
}

export function SortSelect() {
	const dispatch = useAppDispatch();
	const currentSortOption = useAppSelector( selectSort );
	const sortOptions: SortOptions[] = [
		{
			label: 'Relevance',
			value: 'relevance',
		},
		{
			label: 'Date created',
			value: 'date-created',
		},
	];

	const sortDropdownTriggerLabel =
		sortOptions.find( ( sortOption ) => sortOption.value === currentSortOption )?.label || 'Sort';

	const handleSortOptionClick = useCallback(
		( sortOptionValue: IssueSortOption ) => {
			dispatch( setSort( sortOptionValue ) );
			dispatch( updateHistoryWithState() );
		},
		[ dispatch ]
	);

	const [ placement, setPlacement ] = useState< Placement >( getPlacementBasedOnViewport() );

	useEffect( () => {
		const handleResize = () => {
			setPlacement( getPlacementBasedOnViewport() );
		};

		window.addEventListener( 'resize', handleResize );

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [] );

	return (
		<Dropdown placement={ placement } role="listbox">
			<DropdownTrigger aria-label="Sort results by…">
				<OutlineNeutralButton className={ styles.dropdownButton }>
					<SortIcon aria-hidden={ true } className={ styles.inlineIcon } />
					<span>{ sortDropdownTriggerLabel }</span>
					<DownIcon aria-hidden={ true } className={ styles.inlineIcon } />
				</OutlineNeutralButton>
			</DropdownTrigger>
			<DropdownContent aria-label="Sort options">
				{ sortOptions.map( ( sortOption ) => (
					<DropdownItem
						key={ sortOption.value }
						role="option"
						typeaheadLabel={ sortOption.label }
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

function getPlacementBasedOnViewport(): Placement {
	if ( window.innerWidth <= 600 ) {
		return 'bottom-start';
	} else {
		return 'bottom-end';
	}
}
