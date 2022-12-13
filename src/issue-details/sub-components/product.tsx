import React from 'react';
import { useAppSelector } from '../../app';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchResults,
} from '../../reporting-config';
import { SortedFeatureGroupList } from './sorted-feature-group-list';
import { SortedFeatureList } from './sorted-feature-list';
import { CollapsibleTreeNode } from './collapsibleTreeNode';

interface Props {
	id: string;
}

export function Product( { id }: Props ) {
	const { products } = useAppSelector( selectNormalizedReportingConfig );
	const { name, featureGroupIds, featureIds } = products[ id ];

	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const expandedContent = (
		<>
			<SortedFeatureGroupList featureGroupIds={ featureGroupIds } parentName={ name } />
			<SortedFeatureList featureIds={ featureIds } parentName={ name } />
		</>
	);

	const collapsedContent = (
		<>
			<SortedFeatureGroupList
				featureGroupIds={ featureGroupIds.filter( ( featureGroupId ) =>
					searchResults.featureGroups.has( featureGroupId )
				) }
				parentName={ name }
			/>
			<SortedFeatureList
				featureIds={ featureIds.filter( ( featureId ) => searchResults.features.has( featureId ) ) }
				parentName={ name }
			/>
		</>
	);

	return (
		<CollapsibleTreeNode
			name={ name }
			expandedContent={ expandedContent }
			collapsedContent={ collapsedContent }
		/>
	);
}
