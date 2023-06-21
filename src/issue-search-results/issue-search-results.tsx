import React, { ReactNode } from 'react';
import { useAppSelector } from '../app/hooks';
import {
	selectIssueSearchResults,
	selectIssueSearchResultsRequestStatus,
	selectIssueSearchRequestsWereMade,
	selectIssueSearchResultsRequestError,
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
import { selectIssueSearchFiltersAreActive } from '../combined-selectors/issue-search-filters-are-active';
import { selectIssueSearchTerm } from '../issue-search/issue-search-slice';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { useLoggerWithCache } from '../monitoring/use-logger-with-cache';

export function IssueSearchResults() {
	const results = useAppSelector( selectIssueSearchResults );
	const resultsRequestStatus = useAppSelector( selectIssueSearchResultsRequestStatus );
	const resultsRequestError = useAppSelector( selectIssueSearchResultsRequestError );
	const requestsWereMade = useAppSelector( selectIssueSearchRequestsWereMade );
	const filtersAreActive = useAppSelector( selectIssueSearchFiltersAreActive );
	const searchTerm = useAppSelector( selectIssueSearchTerm );

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
				header="Enter some keywords to search for existing issues."
				message="Click on “Report an Issue” to open a bug, request a new feature, and more."
			/>
		);
	} else if ( resultsRequestStatus === 'pending' ) {
		resultsContainerDisplay = (
			<div className={ styles.loadingWrapper }>
				<LoadingIndicator
					message="Finding some existing issues…"
					ariaLabel="Issue search in progress"
				/>
			</div>
		);
	} else if ( resultsRequestStatus === 'error' ) {
		logError( 'Error in issue search request', { errorMessage: resultsRequestError } );
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
					Existing issues found. Results are below.
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
