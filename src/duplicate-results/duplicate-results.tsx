import React, { ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
	selectNoDuplicateRequestsMade,
} from './duplicate-results-slice';
import { DuplicateResultsLoadingIndicator, IssueList } from './sub-components';
import styles from './duplicate-results.module.css';
import { DuplicateResultsInitialPlaceholder } from './sub-components/initial-placeholder';

// TODO: This is a placeholder component for the duplicate results. Modify and tweak however needed! :)
export function DuplicateResults() {
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const noRequestsMade = useAppSelector( selectNoDuplicateRequestsMade );

	let resultsContainerDisplay: ReactNode;

	if ( noRequestsMade ) {
		resultsContainerDisplay = <DuplicateResultsInitialPlaceholder />;
	} else if ( resultsRequestStatus === 'pending' ) {
		resultsContainerDisplay = <DuplicateResultsLoadingIndicator />;
	} else {
		resultsContainerDisplay = <IssueList issues={ results } />;
	}

	return (
		<section>
			<div className={ styles.resultsContainer }>{ resultsContainerDisplay }</div>
			{ ! noRequestsMade && <p>Banner Placeholder</p> }
		</section>
	);
}
