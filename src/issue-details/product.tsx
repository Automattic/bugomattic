import React, { ReactNode, useEffect, useState } from 'react';
import { useAppSelector } from '../app';
import { replaceSpaces, sortEntityIdsByName, SubstringHighlighter } from '../common';
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
	const featureGroupSublistElementId = `product-${ replaceSpaces( id ) }-group-sublist`;
	const featureSublistElementId = `product-${ replaceSpaces( id ) }-feature-sublist`;

	const [ isExpanded, setIsExpanded ] = useState( false );
	const handleCollapseExpandToggle = () => setIsExpanded( ! isExpanded );

	let icon: React.ReactNode;
	if ( isExpanded ) {
		icon = <ExpandedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	} else {
		icon = <CollapsedIcon aria-hidden={ true } className={ styles.inlineIcon } />;
	}

	const { products, featureGroups, features } = useAppSelector( selectNormalizedReportingConfig );
	const { name: productName, featureGroupIds, featureIds } = products[ id ];

	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	// Recollapse after every new search term
	useEffect( () => setIsExpanded( false ), [ searchTerm ] );

	let featureGroupsToDisplay: string[];
	if ( isExpanded ) {
		featureGroupsToDisplay = featureGroupIds;
	} else {
		featureGroupsToDisplay = featureGroupIds.filter( ( featureGroupId ) =>
			searchResults.featureGroups.has( featureGroupId )
		);
	}
	const sortedFeatureGroupsToDisplay = sortEntityIdsByName( featureGroupsToDisplay, featureGroups );

	let featureGroupsOutput: ReactNode = null;
	if ( sortedFeatureGroupsToDisplay.length > 0 ) {
		featureGroupsOutput = (
			<ul
				aria-label={ `List of feature groups for ${ productName }` }
				id={ featureGroupSublistElementId }
				className={ styles.subLevel }
			>
				{ sortedFeatureGroupsToDisplay.map( ( featureGroupId ) => (
					<FeatureGroup key={ featureGroupId } id={ featureGroupId } />
				) ) }
			</ul>
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
	const sortedFeaturesToDisplay = sortEntityIdsByName( featuresToDisplay, features );

	let featuresOutput: ReactNode = null;
	if ( sortedFeaturesToDisplay.length > 0 ) {
		featuresOutput = (
			<div
				aria-label={ `List of features for ${ productName }` }
				id={ featureSublistElementId }
				className={ styles.subLevel }
				role="listbox"
			>
				{ sortedFeaturesToDisplay.map( ( featureId ) => (
					<Feature key={ featureId } id={ featureId } />
				) ) }
			</div>
		);
	}
	return (
		<li>
			<button
				aria-expanded={ isExpanded }
				aria-controls={ [ featureGroupSublistElementId, featureSublistElementId ].join( ' ' ) }
				className={ styles.treeNode }
				onClick={ handleCollapseExpandToggle }
			>
				{ icon }
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ productName }
				</SubstringHighlighter>
			</button>
			{ featureGroupsOutput }
			{ featuresOutput }
		</li>
	);
}
