import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
	selectDuplicateRequestsWereMade,
} from './duplicate-results-slice';
import { IssueList, PlaceholderMessage, useShowBanner } from './sub-components';
import styles from './duplicate-results.module.css';
import { ReactComponent as InitialIllustration } from './svgs/initial-illustration.svg';
import { ReactComponent as NoResultsIllustration } from '../common/svgs/missing-info.svg';
import { LoadingIndicator } from '../common/components';

export function DuplicateResults() {
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const requestsWereMade = useAppSelector( selectDuplicateRequestsWereMade );
	const showBanner = useShowBanner();

	// This ref and corresponding useEffect hook are used to preserve the height of the
	// results container between searches. This keeps the UI from jumping around while searching.
	const resultsContainerContentRef = useRef< HTMLDivElement >( null );
	const [ resultsContainerContentHeightPx, setResultsContainerContentHeightPx ] = useState<
		number | undefined
	>( undefined );

	useEffect( () => {
		if ( resultsRequestStatus === 'fulfilled' ) {
			const newHeight = resultsContainerContentRef.current?.clientHeight;
			setResultsContainerContentHeightPx( newHeight );
		}
	}, [ resultsRequestStatus ] );

	const resultsLimit = 20; // We can tweak this as needed!

	let resultsContainerDisplay: ReactNode;
	if ( ! requestsWereMade ) {
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
				ariaLive="polite"
			/>
		);
	} else {
		resultsContainerDisplay = (
			<>
				<h3 className="screenReaderOnly" aria-live="polite">
					Potential duplicate issues found. Results are below.
				</h3>
				<IssueList issues={ results.slice( 0, resultsLimit ) } />
			</>
		);
	}

	return (
		<section>
			<div
				className={ styles.resultsContainer }
				style={
					resultsContainerContentHeightPx ? { minHeight: resultsContainerContentHeightPx } : {}
				}
			>
				{ /* We need another wrapper here to accurately get the height of the display content */ }
				<div ref={ resultsContainerContentRef }>{ resultsContainerDisplay }</div>
			</div>
			{ showBanner && <p>Banner Placeholder</p> }
		</section>
	);
}
