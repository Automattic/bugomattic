import React, { useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { sortEntityIdsByName } from '../../common';
import { selectNormalizedReportingConfig } from '../../reporting-config/reporting-config-slice';
import { FeatureGroup } from './feature-group';
import styles from './../feature-selector-form.module.css';

interface Props {
	featureGroupIds: string[];
	parentName: string;
}

export function SortedFeatureGroupList( { featureGroupIds, parentName }: Props ) {
	const { featureGroups } = useAppSelector( selectNormalizedReportingConfig );
	const sortedFeatureGroupIds = useMemo(
		() => sortEntityIdsByName( featureGroupIds, featureGroups ),
		[ featureGroupIds, featureGroups ]
	);

	if ( sortedFeatureGroupIds.length === 0 ) {
		return null;
	}

	return (
		<ul
			className={ styles.secondLevel }
			aria-label={ `List of feature groups for ${ parentName }` }
		>
			{ sortedFeatureGroupIds.map( ( featureGroupId ) => (
				<FeatureGroup key={ featureGroupId } id={ featureGroupId } />
			) ) }
		</ul>
	);
}
