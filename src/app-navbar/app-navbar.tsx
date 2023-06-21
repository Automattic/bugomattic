import React, { ButtonHTMLAttributes, forwardRef } from 'react';
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
import { useMonitoring } from '../monitoring/monitoring-provider';

export function AppNavbar() {
	const currentActivePage = useAppSelector( selectActivePage );

	interface MenuItemDetails {
		page: ActivePage;
		component: ReactElement;
	}

	const menuItems: MenuItemDetails[] = [
		{
			page: 'search-for-issues',
			component: <SimpleMenuItem page="search-for-issues" label="Search for Issues" />,
		},
		{
			page: 'report-issue',
			component: <ReportIssueMenuItem />,
		},
	];

	const currentPageIndex = menuItems.findIndex( ( item ) => item.page === currentActivePage );

	// This menubar has the same focus/key rules as a listbox.
	const { focusedIndex, refs, handleKeyDown } = useListboxFocusManager< HTMLButtonElement >(
		'horizontal',
		{
			length: menuItems.length,
			initiallyFocusedIndex: currentPageIndex,
		}
	);

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

// Why all these subcomponents and "forwardingRefs"?
//
// We want to be able to statically define the menu item components in an array for stability
// and predictability.
//
// However, we also need to provide refs and tabIndices to actually rendered menu items.
// These child components help handle forwarding those refs and tabIndices to the right places.

interface SimpleMenuItemProps extends ButtonHTMLAttributes< HTMLButtonElement > {
	page: ActivePage;
	label: string;
}

const SimpleMenuItem = forwardRef< HTMLButtonElement, SimpleMenuItemProps >(
	function SimpleMenuItem( { page, label, tabIndex }, forwardedRef ) {
		const dispatch = useAppDispatch();
		const currentActivePage = useAppSelector( selectActivePage );
		const monitoringClient = useMonitoring();

		const handleClick = ( page: ActivePage ) => () => {
			dispatch( setActivePage( page ) );
			dispatch( updateHistoryWithState() );

			monitoringClient.analytics.recordEvent( 'navbar_item_click', { page } );
		};

		return (
			<button
				ref={ forwardedRef }
				role="menuitem"
				aria-current={ currentActivePage === page ? 'page' : undefined }
				onClick={ handleClick( page ) }
				tabIndex={ tabIndex }
				className={ styles.menuItem }
			>
				<span className={ styles.menuItemLabel }>{ label }</span>
			</button>
		);
	}
);

const ReportIssueMenuItem = forwardRef<
	HTMLButtonElement,
	ButtonHTMLAttributes< HTMLButtonElement >
>( function ReportIssueMenuItem( { tabIndex }, forwardedRef ) {
	const issueType = useAppSelector( selectIssueType );
	const currentActivePage = useAppSelector( selectActivePage );

	if ( issueType !== 'unset' ) {
		return (
			<SimpleMenuItem
				page="report-issue"
				label="Report an Issue"
				ref={ forwardedRef }
				tabIndex={ tabIndex }
			/>
		);
	}

	return (
		<ReportIssueDropdownMenu ref={ forwardedRef } location="navbar">
			<button
				role="menuitem"
				aria-current={ currentActivePage === 'report-issue' ? 'page' : undefined }
				className={ styles.menuItem }
				tabIndex={ tabIndex }
			>
				<span className={ styles.menuItemLabel }>
					<PlusIcon aria-hidden="true" className={ styles.plusIcon } />
					<span>Report an Issue</span>
					<DownChevronIcon aria-hidden="true" />
				</span>
			</button>
		</ReportIssueDropdownMenu>
	);
} );
