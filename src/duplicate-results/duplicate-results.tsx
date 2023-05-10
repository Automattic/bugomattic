import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
	selectDuplicateResults,
	selectDuplicateResultsRequestStatus,
	selectDuplicateRequestsWereMade,
	selectDuplicateResultsRequestError,
} from './duplicate-results-slice';
import { IssueList, PlaceholderMessage, ReportIssueBanner, useShowBanner } from './sub-components';
import styles from './duplicate-results.module.css';
import { ReactComponent as InitialIllustration } from './svgs/initial-illustration.svg';
import { ReactComponent as NoResultsIllustration } from '../common/svgs/missing-info.svg';
import { ReactComponent as ErrorIllustration } from '../common/svgs/warning-triangle.svg';
import { LoadingIndicator } from '../common/components';
import { selectDuplicateSearchFiltersAreActive } from '../combined-selectors/duplicate-search-filters-are-active';
import {
	searchIssues,
	selectDuplicateSearchParams,
} from '../duplicate-search/duplicate-search-slice';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { useLoggerWithCache } from '../monitoring/use-logger-with-cache';

export function DuplicateResults() {
	const dispatch = useAppDispatch();
	const results = useAppSelector( selectDuplicateResults );
	const resultsRequestStatus = useAppSelector( selectDuplicateResultsRequestStatus );
	const resultsRequestError = useAppSelector( selectDuplicateResultsRequestError );
	const requestsWereMade = useAppSelector( selectDuplicateRequestsWereMade );
	const filtersAreActive = useAppSelector( selectDuplicateSearchFiltersAreActive );
	const showBanner = useShowBanner();
	const monitoringClient = useMonitoring();
	const logError = useLoggerWithCache( monitoringClient.logger.error, [] );

	const { searchTerm, sort, statusFilter, activeRepoFilters } = useAppSelector(
		selectDuplicateSearchParams
	);

	// This ref and corresponding useEffect hook are used to preserve the height of the
	// results container between searches. This keeps the UI from jumping around while searching.
	const resultsContainerContentRef = useRef< HTMLDivElement >( null );
	const [ resultsContainerContentHeightPx, setResultsContainerContentHeightPx ] = useState<
		number | undefined
	>( undefined );

	useEffect( () => {
		if (
			resultsRequestStatus === 'fulfilled' ||
			resultsRequestStatus === 'error' ||
			searchTerm === ''
		) {
			const newHeight = resultsContainerContentRef.current?.clientHeight;
			setResultsContainerContentHeightPx( newHeight );
		}
	}, [ resultsRequestStatus, searchTerm ] );

	useEffect( () => {
		if ( searchTerm.trim() !== '' ) {
			dispatch( searchIssues() );
		}
	}, [ searchTerm, sort, statusFilter, activeRepoFilters, dispatch ] );

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
				message="We've logged this error and will look into it. In the meantime, you can retry the search or report a new issue below."
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
