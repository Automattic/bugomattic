import React from 'react';
import { useAppDispatch } from '../app/hooks';
import { DuplicateResults } from '../duplicate-results/duplicate-results';
import { DuplicateSearchControls } from '../duplicate-search/duplicate-search-controls';
import { setActivePage } from '../active-page/active-page-slice';
import { updateHistoryWithState } from '../url-history/actions';

// TODO: This is a placeholder component for the duplicate searching page. Modify and tweak however needed! :)
export function DuplicateSearchingPage() {
	const dispatch = useAppDispatch();
	const handleReportingFlowClick = () => {
		dispatch( setActivePage( 'reportingFlow' ) );
		dispatch( updateHistoryWithState() );
	};
	return (
		<section
			style={ {
				maxWidth: '800px',
				margin: '0 auto',
			} }
		>
			<h2 className="screenReaderOnly">Search for duplicate issues</h2>
			{ /* This isn't the real component in the design, just a placeholder. It probably won't even be in this component */ }
			<button onClick={ handleReportingFlowClick }>Go to reporting flow</button>
			<DuplicateSearchControls />
			<DuplicateResults />
		</section>
	);
}
