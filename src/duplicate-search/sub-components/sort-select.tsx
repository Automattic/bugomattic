import React from 'react';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '../../common/components';

export function SortSelect() {
	return (
		<Dropdown>
			<DropdownTrigger>
				<button>Sort</button>
			</DropdownTrigger>
			<DropdownContent>
				<DropdownItem>
					<button>Relevance</button>
				</DropdownItem>
				<DropdownItem>
					<button>Date Created</button>
				</DropdownItem>
			</DropdownContent>
		</Dropdown>
	);
}
