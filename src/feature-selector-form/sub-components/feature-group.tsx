import React from 'react';
import { useAppSelector } from '../../app';
import { selectNormalizedReportingConfig } from '../../reporting-config';
import { SortedFeatureList } from './sorted-feature-list';
import { ExpandableTreeNode } from './expandable-tree-node';
import { SearchHighlighter } from './search-hightlighter';
import { useExpansionWithSearch } from './use-expansion-with-search';
import { selectReportingConfigSearchResults } from '../../combined-selectors/reporting-config-search-results';

interface Props {
	id: string;
}

export function FeatureGroup( { id }: Props ) {
	const { featureGroups } = useAppSelector( selectNormalizedReportingConfig );
	const { name, featureIds, description } = featureGroups[ id ];

	const { isExpanded, handleCollapseExpandToggle } = useExpansionWithSearch();

	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const label = <SearchHighlighter>{ name }</SearchHighlighter>;

	const featureIdsToDisplay = isExpanded
		? featureIds
		: featureIds.filter( ( featureId ) => searchResults.features.has( featureId ) );

	return (
		<ExpandableTreeNode
			label={ label }
			isExpanded={ isExpanded }
			handleToggle={ handleCollapseExpandToggle }
			description={ description }
		>
			<SortedFeatureList
				featureIds={ featureIdsToDisplay }
				parentName={ name }
				treeLevel={ 'third' }
			/>
		</ExpandableTreeNode>
	);
}
