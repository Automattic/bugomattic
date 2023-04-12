import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
	selectNoDuplicateRequestsMade,
} from './duplicate-results-slice';
import { DuplicateResultsLoadingIndicator, IssueList } from './sub-components';
import styles from './duplicate-results.module.css';
import { DuplicateResultsInitialPlaceholder } from './sub-components/initial-placeholder';
import { NoDuplicateResultsFound } from './sub-components/no-results-found';

// TODO: This is a placeholder component for the duplicate results. Modify and tweak however needed! :)
export function DuplicateResults() {
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const noRequestsMade = useAppSelector( selectNoDuplicateRequestsMade );

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

	let resultsContainerDisplay: ReactNode;

	if ( noRequestsMade ) {
		resultsContainerDisplay = <DuplicateResultsInitialPlaceholder />;
	} else if ( resultsRequestStatus === 'pending' ) {
		resultsContainerDisplay = <DuplicateResultsLoadingIndicator />;
	} else if ( results.length === 0 ) {
		resultsContainerDisplay = <NoDuplicateResultsFound />;
	} else {
		resultsContainerDisplay = <IssueList issues={ results } />;
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
			{ ! noRequestsMade && <p>Banner Placeholder</p> }
		</section>
	);
}
