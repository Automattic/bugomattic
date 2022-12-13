import React from 'react';
import { useAppSelector } from '../../app';
import { sortEntityIdsByName } from '../../common';
import { selectNormalizedReportingConfig } from '../../reporting-config';
import { FeatureGroup } from './feature-group';
import styles from './feature-selector.module.css';

interface Props {
	featureGroupIds: string[];
	parentName: string;
}

export function SortedFeatureGroupList( { featureGroupIds, parentName }: Props ) {
	const { featureGroups } = useAppSelector( selectNormalizedReportingConfig );
	const sortedFeatureGroupIds = sortEntityIdsByName( featureGroupIds, featureGroups );

	if ( sortedFeatureGroupIds.length === 0 ) {
		return null;
	}

	return (
		<ul className={ styles.subLevel } aria-label={ `List of feature groups for ${ parentName }` }>
			{ sortedFeatureGroupIds.map( ( featureGroupId ) => (
				<FeatureGroup key={ featureGroupId } id={ featureGroupId } />
			) ) }
		</ul>
	);
}
