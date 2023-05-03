import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectActivePage } from './active-page-slice';

const PageHeadingFocusContext = createContext< {
	headingRef: React.RefObject< HTMLHeadingElement >;
	skipFocusOnMount: boolean;
} | null >( null );

/**
 * A hook for managing focus on page headers as the page changes through faux-navigation.
 * Whenever the active page changes, we want to move focus to the heading for that page.
 * See "Accessibility Features 1." in this example:
 * https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/
 *
 * @returns A ref to be set on the current page's heading element.
 */
export function usePageHeadingFocus(): React.RefObject< HTMLHeadingElement > {
	const context = useContext( PageHeadingFocusContext );
	const currentActivePage = useAppSelector( selectActivePage );

	if ( context === null ) {
		throw new Error( 'usePageHeadingFocus must be used within a PageHeadingFocusProvider' );
	}

	const { headingRef, skipFocusOnMount } = context;

	useEffect( () => {
		if ( skipFocusOnMount ) {
			return;
		}

		headingRef.current?.focus();
	}, [ headingRef, currentActivePage, skipFocusOnMount ] );

	return headingRef;
}

export function PageHeadingFocusProvider( { children }: { children: React.ReactNode } ) {
	const headingRef = useRef< HTMLHeadingElement >( null );
	const [ isFirstLoad, setIsFirstLoad ] = useState( true );
	useEffect( () => {
		setIsFirstLoad( false );
	}, [] );

	return (
		<PageHeadingFocusContext.Provider value={ { headingRef, skipFocusOnMount: isFirstLoad } }>
			{ children }
		</PageHeadingFocusContext.Provider>
	);
}
