import React, { FunctionComponent, SVGProps, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAllTasksAreComplete } from '../combined-selectors/all-tasks-are-complete';
import { selectTaskIdsForIssueDetails } from '../combined-selectors/relevant-task-ids';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { startOver } from './start-over-counter-slice';
import { updateHistoryWithState } from '../url-history/actions';
import {
	Banner,
	Dropdown,
	DropdownContent,
	DropdownItem,
	DropdownTrigger,
	OutlinePrimaryButton,
} from '../common/components';
import { ReactComponent as ChecklistIllustration } from './checklist-illustration.svg';
import { ActivePage } from '../active-page/types';
import styles from './start-over-banner.module.css';
import { setActivePage } from '../active-page/active-page-slice';
import { ReactComponent as SearchIcon } from '../common/svgs/search.svg';
import { ReactComponent as PlusIcon } from '../common/svgs/plus.svg';
import { ReactComponent as DownChevronIcon } from '../common/svgs/chevron-down.svg';

export function StartOverBanner() {
	const relevantTaskIds = useAppSelector( selectTaskIdsForIssueDetails );
	const allTasksAreComplete = useAppSelector( selectAllTasksAreComplete );

	if ( relevantTaskIds.length === 0 || ! allTasksAreComplete ) {
		return null;
	}

	const headers = [
		'Thank you for reporting the issue!',
		'We appreciate your issue report! Every bit helps!',
		'Thanks for helping improve our software!',
	];
	const randomIndex = Math.floor( Math.random() * headers.length );
	const header = headers[ randomIndex ];

	return (
		<Banner
			aria-label="Start Over"
			illustration={ <ChecklistIllustration /> }
			header={ header }
			message={ 'Start over to report a new issue or go back to duplicate search' }
			actionButton={ <StartOverDropdownMenu /> }
		/>
	);
}

interface MenuOption {
	label: string;
	targetActivePage: ActivePage;
	icon: FunctionComponent< SVGProps< SVGSVGElement > >;
}

function StartOverDropdownMenu() {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const menuOptions: MenuOption[] = [
		{
			label: 'Search for duplicates',
			targetActivePage: 'duplicate-search',
			icon: SearchIcon,
		},
		{
			label: 'Report a new issue',
			targetActivePage: 'report-issue',
			icon: PlusIcon,
		},
	];

	const handleMenuClick = useCallback(
		( targetActivePage: ActivePage ) => {
			dispatch( startOver() );
			dispatch( setActivePage( targetActivePage ) );
			dispatch( updateHistoryWithState() );
			monitoringClient.analytics.recordEvent( 'start_over_click' );
		},
		[ dispatch, monitoringClient.analytics ]
	);

	return (
		<Dropdown role="menu" placement="bottom">
			<DropdownTrigger>
				<OutlinePrimaryButton className={ styles.triggerButton }>
					<span>Start Over</span>
					<DownChevronIcon aria-hidden="true" className={ styles.triggerButtonIcon } />
				</OutlinePrimaryButton>
			</DropdownTrigger>
			<DropdownContent>
				{ menuOptions.map( ( { targetActivePage, label, icon: Icon } ) => (
					<DropdownItem
						key={ targetActivePage }
						typeaheadLabel={ label }
						role="menuitem"
						onClick={ () => handleMenuClick( targetActivePage ) }
						className={ styles.menuItem }
					>
						<Icon aria-hidden="true" className={ styles.menuIcon }></Icon>
						<span>{ label }</span>
					</DropdownItem>
				) ) }
			</DropdownContent>
		</Dropdown>
	);
}
