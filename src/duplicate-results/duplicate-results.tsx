import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
	selectDuplicateRequestsWereMade,
} from './duplicate-results-slice';
import { IssueList, PlaceholderMessage } from './sub-components';
import styles from './duplicate-results.module.css';
import { ReactComponent as InitialIllustration } from './svgs/initial-illustration.svg';
import { ReactComponent as NoResultsIllustration } from '../common/svgs/missing-info.svg';
import { LoadingIndicator } from '../common/components';

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
		resultsContainerDisplay = (
			<PlaceholderMessage
				illustration={ InitialIllustration }
				header="Enter some keywords to search for duplicates."
				message="Click on “Report an Issue” to open a bug, request a few feature, and more."
			/>
		);
	} else if ( resultsRequestStatus === 'pending' ) {
		resultsContainerDisplay = (
			<div className={ styles.loadingWrapper }>
				<LoadingIndicator
					message="Finding some duplicate issues…"
					ariaLabel="Duplicate search in progress"
				/>
			</div>
		);
	} else if ( results.length === 0 ) {
		resultsContainerDisplay = (
			<PlaceholderMessage
				illustration={ NoResultsIllustration }
				header="No results found."
				message="Try a different search or change your filters. You can also report a new issue below."
			/>
		);
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
