import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
	selectNormalizedReportingConfig,
	selectProductIdForFeature,
} from '../../reporting-config/reporting-config-slice';
import styles from './../feature-selector-form.module.css';
import {
	selectFeatureSearchTerm,
	selectSelectedFeatureId,
	setSelectedFeatureId,
} from '../feature-selector-form-slice';
import { includesIgnoringCase, replaceSpaces } from '../../common/lib';
import { SubstringHighlighter } from '../../common/components';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { Tooltip } from 'react-tooltip';

interface Props {
	id: string;
}

export function Feature( { id }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const { features, products } = useAppSelector( selectNormalizedReportingConfig );
	const productId = useAppSelector( selectProductIdForFeature( id ) );
	const productName = productId ? products[ productId ].name : 'Unknown';
	let { name: featureName } = features[ id ];
	const { keywords, description } = features[ id ];

	const handleFeatureSelect = () => {
		dispatch( setSelectedFeatureId( id ) );
		monitoringClient.analytics.recordEvent( 'feature_select', { productName, featureName } );
	};

	const selectedFeatureId = useAppSelector( selectSelectedFeatureId );
	const isSelected = id === selectedFeatureId;
	const classNames = [ styles.treeNode, styles.feature ];
	if ( isSelected ) {
		classNames.push( styles.selectedFeature );
	}

	const searchTerm = useAppSelector( selectFeatureSearchTerm );
	if ( searchTerm !== '' && ! includesIgnoringCase( featureName, searchTerm ) ) {
		const matchingKeyword = keywords?.find( ( keyword ) =>
			includesIgnoringCase( keyword, searchTerm )
		);
		if ( matchingKeyword ) {
			featureName = `${ featureName } (${ matchingKeyword })`;
		}
	}

	const safeId = replaceSpaces( id );
	const buttonId = `button_${ safeId }`;
	const descriptionId = `description_${ safeId }`;

	return (
		<>
			<button
				role="option"
				type="button"
				aria-selected={ isSelected }
				className={ classNames.join( ' ' ) }
				onClick={ handleFeatureSelect }
				id={ buttonId }
				aria-describedby={ descriptionId }
			>
				<SubstringHighlighter
					substring={ searchTerm }
					highlightClassName={ styles.searchSubstringMatch }
				>
					{ featureName }
				</SubstringHighlighter>
			</button>
			<Tooltip
				aria-hidden={ true }
				// Can't use #ID because some characters in IDs may not be safe for that syntax.
				anchorSelect={ `[id='${ buttonId }']` }
				content={ description }
				float={ true }
				noArrow={ true }
				delayShow={ 1000 }
				className={ styles.tooltip }
			/>
			<span hidden={ true } id={ descriptionId }>
				{ description }
			</span>
		</>
	);
}
