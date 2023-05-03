import React, { createRef, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectActivePage, setActivePage } from '../active-page/active-page-slice';
import { ActivePage } from '../active-page/types';
import { updateHistoryWithState } from '../url-history/actions';
import styles from './app-navbar.module.css';
import { ReportIssueDropdownMenu } from '../common/components/report-issue-dropdown-menu';
import { ReactComponent as PlusIcon } from '../common/svgs/plus.svg';
import { ReactComponent as DownChevronIcon } from '../common/svgs/chevron-down.svg';
import { selectIssueType } from '../issue-details/issue-details-slice';

export function AppNavbar() {
	const dispatch = useAppDispatch();
	const issueType = useAppSelector( selectIssueType );
	const currentActivePage = useAppSelector( selectActivePage );

	const [ focusedItem, setFocusedItem ] = useState( currentActivePage );

	const duplicateSearchingRef = createRef< HTMLButtonElement >();

	const simpleReportIssueRef = createRef< HTMLButtonElement >();
	const dropdownReportIssueRef = createRef< HTMLButtonElement >();
	const currentReportingFlowRef = useMemo( () => {
		return issueType === 'unset' ? dropdownReportIssueRef : simpleReportIssueRef;
	}, [ issueType, dropdownReportIssueRef, simpleReportIssueRef ] );

	const handleMenuItemClick = ( page: ActivePage ) => () => {
		// TODO: actually, according to the spec, we're supposed to focus the hidden heading element for each page
		setFocusedItem( page );
		dispatch( setActivePage( page ) );
		dispatch( updateHistoryWithState() );
	};

	const goToNextItem = () => {
		setFocusedItem( 'reportingFlow' );
	};

	const goToPreviousItem = () => {
		setFocusedItem( 'duplicateSearching' );
	};

	const goToFirstItem = () => {
		setFocusedItem( 'duplicateSearching' );
	};

	const goToLastItem = () => {
		setFocusedItem( 'reportingFlow' );
	};

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLUListElement > ) => {
		event.stopPropagation();
		switch ( event.key ) {
			case 'ArrowRight':
				event.preventDefault();
				goToNextItem();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				goToPreviousItem();
				break;
			case 'Home':
				event.preventDefault();
				goToFirstItem();
				break;
			case 'End':
				event.preventDefault();
				goToLastItem();
				break;
		}
	};

	const simpleReportIssue = (
		<button
			role="menuitem"
			ref={ simpleReportIssueRef }
			aria-current={ currentActivePage === 'reportingFlow' ? 'page' : undefined }
			tabIndex={ focusedItem === 'reportingFlow' ? 0 : -1 }
			onClick={ handleMenuItemClick( 'reportingFlow' ) }
			className={ styles.menuItem }
		>
			Report an Issue
		</button>
	);

	const dropDownReportIssue = (
		<ReportIssueDropdownMenu>
			<button
				role="menuitem"
				ref={ dropdownReportIssueRef }
				aria-current={ currentActivePage === 'reportingFlow' ? 'page' : undefined }
				tabIndex={ focusedItem === 'reportingFlow' ? 0 : -1 }
				className={ styles.menuItem }
			>
				<PlusIcon aria-hidden="true" />
				<span>Report an Issue</span>
				<DownChevronIcon aria-hidden="true" />
			</button>
		</ReportIssueDropdownMenu>
	);

	const reportIssueMenuItem = issueType === 'unset' ? dropDownReportIssue : simpleReportIssue;

	useEffect( () => {
		if ( focusedItem === 'duplicateSearching' ) {
			duplicateSearchingRef.current?.focus();
		} else if ( focusedItem === 'reportingFlow' ) {
			currentReportingFlowRef.current?.focus();
		}
	}, [ focusedItem, duplicateSearchingRef, currentReportingFlowRef ] );

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
						aria-current={ currentActivePage === 'duplicateSearching' ? 'page' : undefined }
						tabIndex={ focusedItem === 'duplicateSearching' ? 0 : -1 }
						onClick={ handleMenuItemClick( 'duplicateSearching' ) }
						className={ styles.menuItem }
					>
						Duplicate Search
					</button>
				</li>
				<li role="none">{ reportIssueMenuItem }</li>
			</ul>
		</nav>
	);
}
