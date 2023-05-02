import React, { createRef, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectActivePage, setActivePage } from '../active-page/active-page-slice';
import { ActivePage } from '../active-page/types';
import { updateHistoryWithState } from '../url-history/actions';
import styles from './app-navbar.module.css';

export function AppNavbar() {
	const dispatch = useAppDispatch();
	const currentActivePage = useAppSelector( selectActivePage );

	const [ focusedItem, setFocusedItem ] = useState( currentActivePage );

	const duplicateSearchingRef = createRef< HTMLButtonElement >();
	const reportingFlowRef = createRef< HTMLButtonElement >();

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

	useEffect( () => {
		if ( focusedItem === 'duplicateSearching' ) {
			duplicateSearchingRef.current?.focus();
		} else if ( focusedItem === 'reportingFlow' ) {
			reportingFlowRef.current?.focus();
		}
	}, [ focusedItem, duplicateSearchingRef, reportingFlowRef ] );

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
				<li role="none">
					<button
						role="menuitem"
						ref={ reportingFlowRef }
						aria-current={ currentActivePage === 'reportingFlow' ? 'page' : undefined }
						tabIndex={ focusedItem === 'reportingFlow' ? 0 : -1 }
						onClick={ handleMenuItemClick( 'reportingFlow' ) }
						className={ styles.menuItem }
					>
						Report an Issue
					</button>
				</li>
			</ul>
		</nav>
	);
}
