import React, { ReactNode } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../static-data/reporting-config/reporting-config-slice';
import { SortedFeatureGroupList } from './sorted-feature-group-list';
import { SortedFeatureList } from './sorted-feature-list';
import { ExpandableTreeNode } from './expandable-tree-node';
import { SearchHighlighter } from './search-hightlighter';
import { useExpansionWithSearch } from './use-expansion-with-search';
import { selectReportingConfigSearchResults } from '../../combined-selectors/reporting-config-search-results';
import { selectFeatureSearchTerm } from '../feature-selector-form-slice';
import { MatchedTermsDisplay } from './matched-terms-display';

interface Props {
	id: string;
}

export function Product( { id }: Props ) {
	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const { name, featureGroupIds, featureIds, description } = products[ id ];

	const searchTerm = useAppSelector( selectFeatureSearchTerm );

	const { isExpanded, handleCollapseExpandToggle } = useExpansionWithSearch();

	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const label = <SearchHighlighter>{ name }</SearchHighlighter>;

	let labelDisplay: ReactNode = label;

	if ( searchTerm !== '' && description ) {
		labelDisplay = (
			<>
				{ label }
				<MatchedTermsDisplay entityId={ id } entityType={ 'products' } />
			</>
		);
	}

	const featureGroupIdsToDisplay = isExpanded
		? featureGroupIds
		: featureGroupIds.filter( ( featureGroupId ) => featureGroupId in searchResults.featureGroups );

	const featureIdsToDisplay = isExpanded
		? featureIds
		: featureIds.filter( ( featureId ) => featureId in searchResults.features );

	return (
		<ExpandableTreeNode
			label={ labelDisplay }
			isExpanded={ isExpanded }
			handleToggle={ handleCollapseExpandToggle }
			description={ description }
		>
			<SortedFeatureGroupList featureGroupIds={ featureGroupIdsToDisplay } parentName={ name } />
			<SortedFeatureList
				featureIds={ featureIdsToDisplay }
				parentName={ name }
				treeLevel={ 'second' }
			/>
		</ExpandableTreeNode>
	);
}
