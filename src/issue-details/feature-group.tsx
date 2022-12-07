import React, { useCallback, useState } from 'react';
import { useAppSelector } from '../app';
import { SubstringHighlighter } from '../common';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchResults,
	selectReportingConfigSearchTerm,
} from '../reporting-config';
import { Feature } from './feature';
import styles from './feature-selector.module.css';

interface Props {
	id: string;
}

export function FeatureGroup( { id }: Props ) {
	const [ isExpanded, setIsExpanded ] = useState( false );
	const handleExpandToggle = useCallback( () => {
		setIsExpanded( ! isExpanded );
	}, [ isExpanded, setIsExpanded ] );

	const collapsedIcon = <>&#x2C3;</>;
	const expandedIcon = <>&#x2C5;</>;
	const icon = isExpanded ? expandedIcon : collapsedIcon;

	const { featureGroups } = useAppSelector( selectNormalizedReportingConfig );
	const { name: featureGroupName, featureIds } = featureGroups[ id ];

	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

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
				<span>{ icon }</span>
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ featureGroupName }
				</SubstringHighlighter>
			</button>
			<ul>
				{ featuresToDisplay.map( ( featureId ) => (
					<Feature key={ featureId } id={ featureId } />
				) ) }
			</ul>
		</li>
	);
}
