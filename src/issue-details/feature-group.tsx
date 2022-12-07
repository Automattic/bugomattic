import React, { useCallback, useState } from 'react';
import { useAppSelector } from '../app';
import { sortEntityIdsByName, SubstringHighlighter } from '../common';
import { CollapsedIcon } from '../common/components/collapsed-icon';
import { ExpandedIcon } from '../common/components/expanded-icon';
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

	let icon: React.ReactNode;
	if ( isExpanded ) {
		icon = <ExpandedIcon className={ styles.inlineIcon } />;
	} else {
		icon = <CollapsedIcon className={ styles.inlineIcon } />;
	}

	const { featureGroups, features } = useAppSelector( selectNormalizedReportingConfig );
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

	const sortedFeaturesToDisplay = sortEntityIdsByName( featuresToDisplay, features );

	return (
		<li>
			<button className={ styles.treeNode } onClick={ handleExpandToggle }>
				<span>{ icon }</span>
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ featureGroupName }
				</SubstringHighlighter>
			</button>
			<ul>
				{ sortedFeaturesToDisplay.map( ( featureId ) => (
					<Feature key={ featureId } id={ featureId } />
				) ) }
			</ul>
		</li>
	);
}
