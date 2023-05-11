import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectNormalizedReportingConfig } from '../../static-data/reporting-config/reporting-config-slice';
import { SortedFeatureList } from './sorted-feature-list';
import { ExpandableTreeNode } from './expandable-tree-node';
import { SearchHighlighter } from './search-hightlighter';
import { useExpansionWithSearch } from './use-expansion-with-search';
import { selectReportingConfigSearchResults } from '../../combined-selectors/reporting-config-search-results';
import { MatchedTypeDisplay } from './matched-terms-display';

interface Props {
	id: string;
}

export function FeatureGroup( { id }: Props ) {
	const { featureGroups } = useAppSelector( selectNormalizedReportingConfig );
	const { name, featureIds, description } = featureGroups[ id ];

	const { isExpanded, handleCollapseExpandToggle } = useExpansionWithSearch();

	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const featureIdsToDisplay = isExpanded
		? featureIds
		: featureIds.filter( ( featureId ) => featureId in searchResults.features );

	const labelDisplay = (
		<>
			<SearchHighlighter>{ name }</SearchHighlighter>
			<MatchedTypeDisplay entityId={ id } entityType={ 'featureGroups' } />
		</>
	);

	return (
		<ExpandableTreeNode
			label={ labelDisplay }
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
