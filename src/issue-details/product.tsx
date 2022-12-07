import React, { useCallback, useState } from 'react';
import { useAppSelector } from '../app';
import { SubstringHighlighter } from '../common';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchResults,
	selectReportingConfigSearchTerm,
} from '../reporting-config';
import { Feature } from './feature';
import { FeatureGroup } from './feature-group';
import { FilteredResults } from './types';
import styles from './feature-selector.module.css';

interface Props {
	id: string;
}

export function Product( { id }: Props ) {
	const [ isExpanded, setIsExpanded ] = useState( false );

	const handleExpandToggle = useCallback( () => {
		setIsExpanded( ! isExpanded );
	}, [ isExpanded, setIsExpanded ] );

	const collapsedIcon = <>&#x2C3;</>;
	const expandedIcon = <>&#x2C5;</>;
	const icon = isExpanded ? expandedIcon : collapsedIcon;

	const { products } = useAppSelector( selectNormalizedReportingConfig );
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

	let featuresToDisplay: string[];
	if ( isExpanded ) {
		featuresToDisplay = featureIds;
	} else {
		featuresToDisplay = featureIds.filter( ( featureId ) =>
			searchResults.features.has( featureId )
		);
	}

	return (
		<li>
			<button onClick={ handleExpandToggle }>
				{ icon }
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ productName }
				</SubstringHighlighter>
			</button>
			<ul>
				{ featureGroupsToDisplay.map( ( featureGroupId ) => (
					<FeatureGroup key={ featureGroupId } id={ featureGroupId } />
				) ) }
				{ featuresToDisplay.map( ( featureId ) => (
					<Feature key={ featureId } id={ featureId } />
				) ) }
			</ul>
		</li>
	);
}
