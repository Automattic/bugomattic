import React from 'react';
import { DuplicateResults } from '../duplicate-results/duplicate-results';
import { DuplicateSearchControls } from '../duplicate-search/duplicate-search-controls';
import { usePageHeadingFocus } from '../active-page/page-heading-focus-provider';

export function DuplicateSearchingPage() {
	const headingRef = usePageHeadingFocus();
	return (
		<section
			// TODO: update with a real CSS module for this overall page.
			style={ {
				maxWidth: '920px',
				margin: '0 auto',
			} }
		>
			<h2 ref={ headingRef } className="screenReaderOnly" tabIndex={ -1 }>
				Search for duplicate issues
			</h2>
			<DuplicateSearchControls />
			<DuplicateResults />
		</section>
	);
}
