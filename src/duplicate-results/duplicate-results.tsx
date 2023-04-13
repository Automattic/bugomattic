import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
	selectDuplicateRequestsWereMade,
} from './duplicate-results-slice';
import { DuplicateResultsLoadingIndicator, IssueList } from './sub-components';
import styles from './duplicate-results.module.css';
import { DuplicateResultsInitialPlaceholder } from './sub-components/initial-placeholder';
import { NoDuplicateResultsFound } from './sub-components/no-results-found';

export function DuplicateResults() {
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const requestsMade = useAppSelector( selectDuplicateRequestsWereMade );

	// We want to handle the case when we come back to this page.
	// Since this is local state, we want to tie it back to the redux state.
	const [ showBanner, setShowBanner ] = useState( requestsMade );

	useEffect( () => {
		if ( requestsMade && resultsRequestStatus === 'fulfilled' ) {
			setShowBanner( true );
		}
	}, [ requestsMade, resultsRequestStatus ] );

	const resultsContainerContentRef = useRef< HTMLDivElement >( null );
	const [ resultsContainerContentHeight, setResultsContainerContentHeight ] = useState<
		number | undefined
	>( undefined );

	useEffect( () => {
		if ( resultsRequestStatus === 'fulfilled' ) {
			const newHeight = resultsContainerContentRef.current?.clientHeight;
			setResultsContainerContentHeight( newHeight );
		}
	}, [ resultsRequestStatus ] );

	const resultsLimit = 20; // We can tweak this as needed!

	let resultsContainerDisplay: ReactNode;
	if ( ! requestsMade ) {
		resultsContainerDisplay = <DuplicateResultsInitialPlaceholder />;
	} else if ( resultsRequestStatus === 'pending' ) {
		resultsContainerDisplay = <DuplicateResultsLoadingIndicator />;
	} else if ( results.length === 0 ) {
		resultsContainerDisplay = <NoDuplicateResultsFound />;
	} else {
		resultsContainerDisplay = <IssueList issues={ results.slice( 0, resultsLimit ) } />;
	}

	return (
		<section>
			<div
				className={ styles.resultsContainer }
				style={ resultsContainerContentHeight ? { minHeight: resultsContainerContentHeight } : {} }
			>
				{ /* We need another wrapper here to accurately get the height of the display content */ }
				<div ref={ resultsContainerContentRef }>{ resultsContainerDisplay }</div>
			</div>
			{ showBanner && <p>Banner Placeholder</p> }
		</section>
	);
}
