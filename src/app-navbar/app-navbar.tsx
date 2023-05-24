import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectActivePage, setActivePage } from '../active-page/active-page-slice';
import { ActivePage } from '../active-page/types';
import { updateHistoryWithState } from '../url-history/actions';
import styles from './app-navbar.module.css';
import { ReportIssueDropdownMenu } from '../common/components/report-issue-dropdown-menu';
import { ReactComponent as PlusIcon } from '../common/svgs/plus.svg';
import { ReactComponent as DownChevronIcon } from '../common/svgs/chevron-down.svg';
import { selectIssueType } from '../issue-details/issue-details-slice';
import { useListboxFocusManager } from '../common/components';
import { ReactElement } from 'react';

export function AppNavbar() {
	const dispatch = useAppDispatch();
	const issueType = useAppSelector( selectIssueType );
	const currentActivePage = useAppSelector( selectActivePage );

	const handleSimpleMenuItemClick = ( page: ActivePage ) => () => {
		dispatch( setActivePage( page ) );
		dispatch( updateHistoryWithState() );
	};

	/*
	The key to this component is managing focus. How fun! :)
	For reference, see these two WAI ARIA articles:
	https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ - rules for menubars.
	https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/ - example we're following.

	In short, we need to make sure keyboard and tabbing focus is handled correctly within the menubar.
	And, after we've navigated to a new page, we need to make sure the heading for that page is focused.
	The page heading focus happens in a hook elsewhere.
	*/

	const duplicateSearchMenuItem = (
		<button
			role="menuitem"
			aria-current={ currentActivePage === 'duplicate-search' ? 'page' : undefined }
			onClick={ handleSimpleMenuItemClick( 'duplicate-search' ) }
			className={ styles.menuItem }
		>
			<span className={ styles.menuItemLabel }>Duplicate Search</span>
		</button>
	);

	const simpleReportIssueMenuItem = (
		<button
			role="menuitem"
			aria-current={ currentActivePage === 'report-issue' ? 'page' : undefined }
			onClick={ handleSimpleMenuItemClick( 'report-issue' ) }
			className={ styles.menuItem }
		>
			<span className={ styles.menuItemLabel }>Report an Issue</span>
		</button>
	);

	const dropdownReportIssueMenuItem = (
		<ReportIssueDropdownMenu>
			<button
				role="menuitem"
				aria-current={ currentActivePage === 'report-issue' ? 'page' : undefined }
				className={ styles.menuItem }
			>
				<span className={ styles.menuItemLabel }>
					<PlusIcon aria-hidden="true" className={ styles.plusIcon } />
					<span>Report an Issue</span>
					<DownChevronIcon aria-hidden="true" />
				</span>
			</button>
		</ReportIssueDropdownMenu>
	);

	interface MenuItemDetails {
		page: ActivePage;
		component: ReactElement;
	}

	const menuItems: MenuItemDetails[] = [
		{
			page: 'duplicate-search',
			component: duplicateSearchMenuItem,
		},
		{
			page: 'report-issue',
			component: issueType === 'unset' ? dropdownReportIssueMenuItem : simpleReportIssueMenuItem,
		},
	];

	const currentPageIndex = menuItems.findIndex( ( item ) => item.page === currentActivePage );

	// Menubars have just about the same focus/key rules as listboxes.
	const { focusedIndex, refs, handleKeyDown } = useListboxFocusManager< HTMLButtonElement >(
		'horizontal',
		{
			length: menuItems.length,
			initiallyFocusedIndex: currentPageIndex,
		}
	);

	console.log( focusedIndex );

	return (
		<nav aria-label="Bugomattic site navigation" className={ styles.navWrapper }>
			<ul
				role="menubar"
				aria-orientation="horizontal"
				aria-label="Bugomattic site navigation menu"
				onKeyDown={ handleKeyDown }
				className={ styles.menuBar }
			>
				{ menuItems.map( ( item, index ) => (
					<li role="none" key={ item.page }>
						{ React.cloneElement( item.component, {
							ref: refs.current[ index ],
							tabIndex: focusedIndex === index ? 0 : -1,
						} ) }
					</li>
				) ) }
			</ul>
		</nav>
	);
}
