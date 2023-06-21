import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectActivePage } from './active-page-slice';
import { ActivePage } from './types';
import { selectStartOverCounter } from '../start-over/start-over-counter-slice';

interface PageNavigationContextType {
	pageHeadingRef: React.RefObject< HTMLHeadingElement >;
	isInitialLoadRef: React.MutableRefObject< boolean >;
}

interface PageNavigationDetails {
	pageHeadingRef: React.RefObject< HTMLHeadingElement >;
}

const PageHeadingFocusContext = createContext< PageNavigationContextType | null >( null );

/**
 * A hook for managing focus on page headers as the page changes through faux-navigation.
 * Whenever the active page changes, we want to move focus to the heading for that page.
 * See "Accessibility Features 1." in this example:
 * https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/
 *
 * @returns An object with navigation details, including a ref to the page heading.
 */
export function usePageNavigation(): PageNavigationDetails {
	const context = useContext( PageHeadingFocusContext );
	const currentActivePage = useAppSelector( selectActivePage );
	const startOverCounter = useAppSelector( selectStartOverCounter );

	if ( context === null ) {
		throw new Error( 'usePageHeadingFocus must be used within a PageHeadingFocusProvider' );
	}

	const { pageHeadingRef, isInitialLoadRef } = context;

	useEffect( () => {
		// We always want to set the document title, even on the initial render!
		document.title = getDocumentTitleForPage( currentActivePage );

		// But the other side effects should only run after the initial load and render.
		if ( isInitialLoadRef.current ) {
			isInitialLoadRef.current = false;
			return;
		}

		globalThis.scrollTo( 0, 0 );
		pageHeadingRef.current?.focus();
	}, [
		pageHeadingRef, // This won't trigger rerenders -- the reference will stay the same
		isInitialLoadRef, // This won't trigger rerenders -- the reference will stay the same
		currentActivePage, // This is the main trigger: when the active page changes, run the navigation side effects
		startOverCounter, // Starting over main not change the active page, but it's effectively like a navigation
	] );

	return { pageHeadingRef };
}

export function PageNavigationProvider( { children }: { children: React.ReactNode } ) {
	const pageHeadingRef = useRef< HTMLHeadingElement >( null );
	const isInitialLoadRef = useRef( true );

	return (
		<PageHeadingFocusContext.Provider value={ { pageHeadingRef, isInitialLoadRef } }>
			{ children }
		</PageHeadingFocusContext.Provider>
	);
}

function getDocumentTitleForPage( activePage: ActivePage ): string {
	switch ( activePage ) {
		case 'search-for-issues':
			return 'Bugomattic - Search for issues';
		case 'report-issue':
			return 'Bugomattic - Report a new issue';
		default:
			return 'Bugomattic';
	}
}
