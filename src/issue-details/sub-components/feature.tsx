import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app';
import {
	selectNormalizedReportingConfig,
	selectReportingConfigSearchTerm,
} from '../../reporting-config';
import { selectIssueDetails, setIssueFeatureId } from '../issue-details-slice';
import { includesIgnoringCase, SubstringHighlighter } from '../../common';
import styles from './../feature-selector-form.module.css';

interface Props {
	id: string;
}

export function Feature( { id }: Props ) {
	const dispatch = useAppDispatch();
	const handleFeatureSelect = () => dispatch( setIssueFeatureId( id ) );

	const { featureId: selectedFeatureId } = useAppSelector( selectIssueDetails );
	const isSelected = id === selectedFeatureId;
	const classNames = [ styles.treeNode, styles.feature ];
	if ( isSelected ) {
		classNames.push( styles.selectedFeature );
	}

	const { features } = useAppSelector( selectNormalizedReportingConfig );
	let { name } = features[ id ];
	const { keywords, description } = features[ id ];

	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	if ( searchTerm !== '' && ! includesIgnoringCase( name, searchTerm ) ) {
		const matchingKeyword = keywords?.find( ( keyword ) =>
			includesIgnoringCase( keyword, searchTerm )
		);
		if ( matchingKeyword ) {
			name = `${ name } (${ matchingKeyword })`;
		}
	}

	return (
		<button
			role="option"
			aria-selected={ isSelected }
			className={ classNames.join( ' ' ) }
			onClick={ handleFeatureSelect }
			title={ description }
			aria-description={ description }
		>
			<SubstringHighlighter
				substring={ searchTerm }
				highlightClassName={ styles.searchSubstringMatch }
			>
				{ name }
			</SubstringHighlighter>
		</button>
	);
}
