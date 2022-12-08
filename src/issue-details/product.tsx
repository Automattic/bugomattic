import React, { useCallback, useState } from 'react';
import { useAppSelector } from '../app';
import { sortEntityIdsByName, SubstringHighlighter } from '../common';
import { ReactComponent as CollapsedIcon } from '../common/svgs/chevron-right.svg';
import { ReactComponent as ExpandedIcon } from '../common/svgs/chevron-down.svg';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchResults,
	selectReportingConfigSearchTerm,
} from '../reporting-config';
import { Feature } from './feature';
import { FeatureGroup } from './feature-group';
import styles from './feature-selector.module.css';

interface Props {
	id: string;
}

export function Product( { id }: Props ) {
	const [ isExpanded, setIsExpanded ] = useState( false );

	const handleExpandToggle = useCallback( () => {
		setIsExpanded( ! isExpanded );
	}, [ isExpanded, setIsExpanded ] );

	let icon: React.ReactNode;
	if ( isExpanded ) {
		icon = <ExpandedIcon className={ styles.inlineIcon } />;
	} else {
		icon = <CollapsedIcon className={ styles.inlineIcon } />;
	}

	const { products, featureGroups, features } = useAppSelector( selectNormalizedReportingConfig );
	const { name: productName, featureGroupIds, featureIds } = products[ id ];

	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	let featureGroupsToDisplay: string[];
	if ( isExpanded ) {
		featureGroupsToDisplay = featureGroupIds;
	} else {
		featureGroupsToDisplay = featureGroupIds.filter( ( featureGroupId ) =>
			searchResults.featureGroups.has( featureGroupId )
		);
	}
	const sortedFeatureGroupsToDisplay = sortEntityIdsByName( featureGroupsToDisplay, featureGroups );

	let featuresToDisplay: string[];
	if ( isExpanded ) {
		featuresToDisplay = featureIds;
	} else {
		featuresToDisplay = featureIds.filter( ( featureId ) =>
			searchResults.features.has( featureId )
		);
	}
	const sortedFeaturesToDisplay = sortEntityIdsByName( featuresToDisplay, features );

	return (
		<li>
			<button className={ styles.treeNode } onClick={ handleExpandToggle }>
				{ icon }
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ productName }
				</SubstringHighlighter>
			</button>
			<ul className={ styles.subLevel }>
				{ sortedFeatureGroupsToDisplay.map( ( featureGroupId ) => (
					<FeatureGroup key={ featureGroupId } id={ featureGroupId } />
				) ) }
				{ sortedFeaturesToDisplay.map( ( featureId ) => (
					<Feature key={ featureId } id={ featureId } />
				) ) }
			</ul>
		</li>
	);
}
