import React, { FormEventHandler, ReactNode, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectReportingConfigSearchResults } from '../combined-selectors/reporting-config-search-results';
import { DebouncedSearch, FormErrorMessage } from '../common/components';
import { setIssueFeatureId } from '../issue-details/issue-details-slice';
import { selectNormalizedReportingConfig } from '../reporting-config/reporting-config-slice';
import {
	selectFeatureSearchTerm,
	selectSelectedFeatureId,
	setFeatureSearchTerm,
} from './feature-selector-form-slice';
import styles from './feature-selector-form.module.css';
import { SortedProductList } from './sub-components';
import { SelectedFeatureDetails } from './sub-components/selected-feature-details';

export function FeatureSelectorForm() {
	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const searchTerm = useAppSelector( selectFeatureSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );
	const selectedFeatureId = useAppSelector( selectSelectedFeatureId );

	const [ submissionAttempted, setSubmissionAttempted ] = useState( false );

	const readyToContinue = selectedFeatureId !== null;

	const dispatch = useAppDispatch();
	const handleSearch = useCallback(
		( searchTerm: string ) => {
			dispatch( setFeatureSearchTerm( searchTerm ) );
		},
		[ dispatch ]
	);

	const handleSubmit: FormEventHandler< HTMLFormElement > = ( event ) => {
		event.preventDefault();
		setSubmissionAttempted( true );
		if ( readyToContinue ) {
			dispatch( setIssueFeatureId( selectedFeatureId ) );
		}
	};

	const noResultsFound = searchTerm && searchResults.products.size === 0;
	const noResultsFoundMessage = (
		<p className={ styles.noResultsMessage } aria-live="polite">
			No results found. Try a different search or explore manually below.
		</p>
	);

	const allProductIds = Object.keys( products );
	let productsToDisplay: string[];
	if ( ! searchTerm || noResultsFound ) {
		productsToDisplay = allProductIds;
	} else {
		productsToDisplay = allProductIds.filter( ( productId ) =>
			searchResults.products.has( productId )
		);
	}

	const searchControlsId = 'reporting-config-tree-id';

	const showFormError = submissionAttempted && ! readyToContinue;

	let bottomPanelDisplay: ReactNode;
	if ( showFormError ) {
		bottomPanelDisplay = <FormErrorMessage>You must select a feature</FormErrorMessage>;
	} else if ( selectedFeatureId ) {
		bottomPanelDisplay = <SelectedFeatureDetails featureId={ selectedFeatureId } />;
	} else {
		bottomPanelDisplay = null;
	}

	return (
		<section className={ styles.sectionWrapper }>
			<div className={ styles.searchWrapper }>
				<DebouncedSearch
					callback={ handleSearch }
					placeholder="Search for a feature"
					inputAriaControls={ searchControlsId }
				/>
			</div>

			<form onSubmit={ handleSubmit }>
				<div className={ styles.treeWrapper } id={ searchControlsId }>
					{ noResultsFound && noResultsFoundMessage }
					<SortedProductList productIds={ productsToDisplay } />
				</div>

				<div className={ styles.bottomPanel }>
					<div>{ bottomPanelDisplay }</div>
					<div className={ styles.continueButtonWrapper }>
						<button className="primaryButton">Continue</button>
					</div>
				</div>
			</form>
		</section>
	);
}
