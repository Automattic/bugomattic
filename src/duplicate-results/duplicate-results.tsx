import React, { ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
} from './duplicate-results-slice';

// TODO: This is a placeholder component for the duplicate results. Modify and tweak however needed! :)
export function DuplicateResults() {
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );

	let display: ReactNode;
	if ( resultsRequestStatus === 'pending' ) {
		display = <p>Loading...</p>;
	} else {
		display = (
			<>
				{ results.map( ( result ) => (
					<div key={ result.url }>{ result.content }</div>
				) ) }
			</>
		);
	}
	return <section>{ display }</section>;
}
