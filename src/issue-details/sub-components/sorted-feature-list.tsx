import React, { useMemo } from 'react';
import { useAppSelector } from '../../app';
import { sortEntityIdsByName } from '../../common';
import { selectNormalizedReportingConfig } from '../../reporting-config';
import { Feature } from './feature';
import styles from './../feature-selector.module.css';

interface Props {
	featureIds: string[];
	parentName: string;
	treeLevel: 'second' | 'third';
}

export function SortedFeatureList( { featureIds, parentName, treeLevel }: Props ) {
	const { features } = useAppSelector( selectNormalizedReportingConfig );
	const sortedFeatureIds = useMemo(
		() => sortEntityIdsByName( featureIds, features ),
		[ featureIds, features ]
	);

	let parentClass: string | undefined = undefined;
	if ( treeLevel === 'second' ) {
		parentClass = styles.secondLevel;
	} else if ( treeLevel === 'third' ) {
		parentClass = styles.thirdLevel;
	}

	if ( sortedFeatureIds.length === 0 ) {
		return null;
	}

	return (
		<div
			className={ parentClass }
			role="listbox"
			aria-label={ `List of features for ${ parentName }` }
		>
			{ sortedFeatureIds.map( ( featureId ) => (
				<Feature key={ featureId } id={ featureId } />
			) ) }
		</div>
	);
}
