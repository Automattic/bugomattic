import React, { ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
	selectDuplicateRequestsWereMade,
	selectDuplicateResultsRequestError,
} from './issue-search-results-slice';
import {
	IssueList,
	PlaceholderMessage,
	ReportIssueBanner,
	useSetHeightAfterRequest,
	useShowBanner,
} from './sub-components';
import styles from './issue-search-results.module.css';
import { ReactComponent as InitialIllustration } from './svgs/initial-illustration.svg';
import { ReactComponent as NoResultsIllustration } from '../common/svgs/missing-info-illustration.svg';
import { ReactComponent as ErrorIllustration } from '../common/svgs/warning.svg';
import { LoadingIndicator } from '../common/components';
import { selectDuplicateSearchFiltersAreActive } from '../combined-selectors/issue-search-filters-are-active';
import { selectDuplicateSearchTerm } from '../issue-search/issue-search-slice';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { useLoggerWithCache } from '../monitoring/use-logger-with-cache';

export function DuplicateResults() {
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const resultsRequestError = useAppSelector( selectDuplicateResultsRequestError );
	const requestsWereMade = useAppSelector( selectDuplicateRequestsWereMade );
	const filtersAreActive = useAppSelector( selectDuplicateSearchFiltersAreActive );
	const searchTerm = useAppSelector( selectDuplicateSearchTerm );

	const monitoringClient = useMonitoring();
	const logError = useLoggerWithCache( monitoringClient.logger.error, [] );

	const showBanner = useShowBanner();

	const { resultsContainerContentRef, resultsContainerContentHeightPx } =
		useSetHeightAfterRequest();

	const resultsLimit = 20; // We can tweak this as needed!

	let resultsContainerDisplay: ReactNode;
	if ( ! requestsWereMade || searchTerm === '' ) {
		resultsContainerDisplay = (
			<PlaceholderMessage
				illustration={ <InitialIllustration /> }
				header="Enter some keywords to search for duplicates."
				message="Click on “Report an Issue” to open a bug, request a new feature, and more."
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
	} else if ( resultsRequestStatus === 'error' ) {
		logError( 'Error in duplicate search request', { errorMessage: resultsRequestError } );
		resultsContainerDisplay = (
			<PlaceholderMessage
				illustration={ <ErrorIllustration className={ styles.errorIllustration } /> }
				header="Uh oh! Something went wrong."
				message="We've logged this error and will look into it. In the meantime, try refreshing the page to ensure all your tokens are fresh. You can also still report a new issue below."
				ariaLive="assertive"
			/>
		);
	} else if ( results.length === 0 ) {
		resultsContainerDisplay = (
			<PlaceholderMessage
				illustration={ <NoResultsIllustration /> }
				header="No results found."
				message="Try a different search or change your filters. You can also report a new issue below."
				additionalScreenReaderText={
					filtersAreActive ? 'Search filters are currently active.' : undefined
				}
				ariaLive="polite"
			/>
		);
	} else {
		resultsContainerDisplay = (
			<>
				<h3 className="screenReaderOnly" aria-live="polite">
					Potential duplicate issues found. Results are below.
					{ filtersAreActive && ' Search filters are currently active.' }
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
			{ showBanner && <ReportIssueBanner /> }
		</section>
	);
}
