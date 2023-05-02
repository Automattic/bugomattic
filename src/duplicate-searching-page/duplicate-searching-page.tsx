import React from 'react';
import { DuplicateResults } from '../duplicate-results/duplicate-results';
import { DuplicateSearchControls } from '../duplicate-search/duplicate-search-controls';

// TODO: This is a placeholder component for the duplicate searching page. Modify and tweak however needed! :)
export function DuplicateSearchingPage() {
	return (
		<section
			// TODO: update with a real CSS module for this overall page.
			style={ {
				maxWidth: '920px',
				margin: '0 auto',
			} }
		>
			<h2 className="screenReaderOnly">Search for duplicate issues</h2>
			<DuplicateSearchControls />
			<DuplicateResults />
		</section>
	);
}
