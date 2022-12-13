import React from 'react';
import { useAppSelector } from '../../app';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchResults,
} from '../../reporting-config';
import { SortedFeatureList } from './sorted-feature-list';
import { CollapsibleTreeNode } from './collapsibleTreeNode';

interface Props {
	id: string;
}

export function FeatureGroup( { id }: Props ) {
	const { featureGroups } = useAppSelector( selectNormalizedReportingConfig );
	const { name, featureIds } = featureGroups[ id ];

	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const expandedContent = <SortedFeatureList featureIds={ featureIds } parentName={ name } />;

	const collapsedContent = (
		<SortedFeatureList
			featureIds={ featureIds.filter( ( featureId ) => searchResults.features.has( featureId ) ) }
			parentName={ name }
		/>
	);

	return (
		<CollapsibleTreeNode
			name={ name }
			expandedContent={ expandedContent }
			collapsedContent={ collapsedContent }
		/>
	);
}
