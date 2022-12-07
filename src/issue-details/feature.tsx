import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchTerm,
} from '../reporting-config';
import { selectIssueDetails, setIssueFeatureId } from './issue-details-slice';
import { includesIgnoringCase, SubstringHighlighter } from '../common';
import styles from './feature-selector.module.css';

interface Props {
	id: string;
}

export function Feature( { id }: Props ) {
	const dispatch = useAppDispatch();
	const handleFeatureSelect = useCallback(
		() => dispatch( setIssueFeatureId( id ) ),
		[ dispatch, setIssueFeatureId, id ]
	);

	const { featureId: selectedFeatureId } = useAppSelector( selectIssueDetails );
	const isSelected = id === selectedFeatureId;

	const { features } = useAppSelector( selectNormalizedReportingConfig );
	const featureDetails = features[ id ];
	let featureName = featureDetails.name;
	const keywords = featureDetails.keywords;

	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	if ( searchTerm !== '' && ! includesIgnoringCase( featureName, searchTerm ) ) {
		const matchingKeyword = keywords?.find( ( keyword ) =>
			includesIgnoringCase( keyword, searchTerm )
		);
		if ( matchingKeyword ) {
			featureName = `${ featureName } (${ matchingKeyword })`;
		}
	}

	return (
		<li>
			<button
				className={ [ styles.treeNode, isSelected ? styles.selectedFeature : '' ].join( ' ' ) }
				onClick={ handleFeatureSelect }
			>
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ featureName }
				</SubstringHighlighter>
			</button>
		</li>
	);
}
