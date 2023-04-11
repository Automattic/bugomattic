import React, { ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
} from './duplicate-results-slice';
import { IssueList } from './sub-components';

// TODO: This is a placeholder component for the duplicate results. Modify and tweak however needed! :)
export function DuplicateResults() {
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );

	let display: ReactNode;
	if ( resultsRequestStatus === 'pending' ) {
		display = <p>Loading...</p>;
	} else {
		display = <IssueList issues={ results } />;
	}
	return <section>{ display }</section>;
}
