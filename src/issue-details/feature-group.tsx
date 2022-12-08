import React, { useEffect, useState } from 'react';
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
import styles from './feature-selector.module.css';

interface Props {
	id: string;
}

export function FeatureGroup( { id }: Props ) {
	const sublistElementId = `feature-group-${ id }-sublist`;

	const [ isExpanded, setIsExpanded ] = useState( false );
	const handleCollapseExpandToggle = () => setIsExpanded( ! isExpanded );

	let icon: React.ReactNode;
	if ( isExpanded ) {
		icon = <ExpandedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	} else {
		icon = <CollapsedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	}

	const { featureGroups, features } = useAppSelector( selectNormalizedReportingConfig );
	const { name: featureGroupName, featureIds } = featureGroups[ id ];

	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	// Recollapse after every new search term
	useEffect( () => setIsExpanded( false ), [ searchTerm ] );

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
			<button
				aria-expanded={ isExpanded }
				aria-controls={ sublistElementId }
				className={ styles.treeNode }
				onClick={ handleCollapseExpandToggle }
			>
				{ icon }
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ featureGroupName }
				</SubstringHighlighter>
			</button>
			<ul
				aria-label={ `List of features for ${ featureGroupName }` }
				id={ sublistElementId }
				className={ styles.subLevel }
			>
				{ sortedFeaturesToDisplay.map( ( featureId ) => (
					<Feature key={ featureId } id={ featureId } />
				) ) }
			</ul>
		</li>
	);
}
