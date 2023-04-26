import React from 'react';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '../../common/components';

export function SortSelect() {
	return (
		<Dropdown>
			<DropdownTrigger>
				<button aria-haspopup="listbox">Sort</button>
			</DropdownTrigger>
			<DropdownContent role="listbox">
				<DropdownItem role="option">Relevance</DropdownItem>
				<DropdownItem role="option">Date Created</DropdownItem>
			</DropdownContent>
		</Dropdown>
	);
}
