import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectActivePage, setActivePage } from '../active-page/active-page-slice';
import { ActivePage } from '../active-page/types';
import { updateHistoryWithState } from '../url-history/actions';
import styles from './app-navbar.module.css';
import { ReportIssueDropdownMenu } from '../common/components/report-issue-dropdown-menu';
import { ReactComponent as PlusIcon } from '../common/svgs/plus.svg';
import { ReactComponent as DownChevronIcon } from '../common/svgs/chevron-down.svg';
import { selectIssueType } from '../issue-details/issue-details-slice';
import { useListboxKeyboardNavigation } from '../common/components';

export function AppNavbar() {
	const dispatch = useAppDispatch();
	const issueType = useAppSelector( selectIssueType );
	const currentActivePage = useAppSelector( selectActivePage );

	/*
	The key to this component is managing focus. How fun! :)
	For reference, see these two WAI ARIA articles:
	https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ - rules for menubars.
	https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/ - example we're following.

	In short, we need to make sure keyboard and tabbing focus is handled correctly within the menubar.
	And, after we've navigated to a new page, we need to make sure the heading for that page is focused.

	The page heading focus happens in a hook elsewhere, but it's the main reason for an imperative focus
	approach here. I.e., we are focusing refs directly on keydown events, rather than relying on a useEffect hook.
	That imperative approach is here way more resilient to focus race conditions.
	*/

	// We still need this local state variable because it helps us track the "Roving tabindex"
	// See: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_general_within
	const [ focusedMenuItem, setFocusedMenuItem ] = useState( currentActivePage );

	const duplicateSearchingRef = useRef< HTMLButtonElement >( null );

	const simpleReportIssueRef = useRef< HTMLButtonElement >( null );
	const dropdownReportIssueRef = useRef< HTMLButtonElement >( null );
	const currentReportIssueRef =
		issueType === 'unset' ? dropdownReportIssueRef : simpleReportIssueRef;

	const focusMenuItem = ( menuItem: ActivePage ) => {
		setFocusedMenuItem( menuItem );

		switch ( menuItem ) {
			case 'duplicate-search':
				duplicateSearchingRef.current?.focus();
				break;
			case 'report-issue':
				currentReportIssueRef.current?.focus();
				break;
		}
	};

	const goToNext = () => {
		focusMenuItem( 'report-issue' );
	};

	const goToPrevious = () => {
		focusMenuItem( 'duplicate-search' );
	};

	const goToFirst = () => {
		focusMenuItem( 'duplicate-search' );
	};

	const goToLast = () => {
		focusMenuItem( 'report-issue' );
	};

	// The keyboard navigation rules are effectively the same for menubars and listboxes.
	const handleKeyDown = useListboxKeyboardNavigation( 'horizontal', {
		goToNext,
		goToPrevious,
		goToFirst,
		goToLast,
	} );

	const handleMenuItemClick = ( page: ActivePage ) => () => {
		dispatch( setActivePage( page ) );
		dispatch( updateHistoryWithState() );
	};

	const simpleReportIssue = (
		<button
			role="menuitem"
			ref={ simpleReportIssueRef }
			aria-current={ currentActivePage === 'report-issue' ? 'page' : undefined }
			tabIndex={ focusedMenuItem === 'report-issue' ? 0 : -1 }
			onClick={ handleMenuItemClick( 'report-issue' ) }
			className={ styles.menuItem }
		>
			<span className={ styles.menuItemLabel }>Report an Issue</span>
		</button>
	);

	const dropdownReportIssue = (
		<ReportIssueDropdownMenu ref={ dropdownReportIssueRef }>
			<button
				role="menuitem"
				aria-current={ currentActivePage === 'report-issue' ? 'page' : undefined }
				tabIndex={ focusedMenuItem === 'report-issue' ? 0 : -1 }
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

	const reportIssueMenuItem = issueType === 'unset' ? dropdownReportIssue : simpleReportIssue;

	return (
		<nav aria-label="Bugomattic site navigation" className={ styles.navWrapper }>
			<ul
				role="menubar"
				aria-orientation="horizontal"
				aria-label="Bugomattic site navigation menu"
				onKeyDown={ handleKeyDown }
				className={ styles.menuBar }
			>
				<li role="none">
					<button
						role="menuitem"
						ref={ duplicateSearchingRef }
						aria-current={ currentActivePage === 'duplicate-search' ? 'page' : undefined }
						tabIndex={ focusedMenuItem === 'duplicate-search' ? 0 : -1 }
						onClick={ handleMenuItemClick( 'duplicate-search' ) }
						className={ styles.menuItem }
					>
						<span className={ styles.menuItemLabel }>Duplicate Search</span>
					</button>
				</li>
				<li role="none">{ reportIssueMenuItem }</li>
			</ul>
		</nav>
	);
}
