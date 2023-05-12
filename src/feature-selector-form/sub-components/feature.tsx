import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
	selectNormalizedReportingConfig,
	selectProductIdForFeature,
} from '../../static-data/reporting-config/reporting-config-slice';
import styles from './../feature-selector-form.module.css';
import { selectSelectedFeatureId, setSelectedFeatureId } from '../feature-selector-form-slice';
import { replaceSpaces } from '../../common/lib';
import { SearchHighlighter } from './search-hightlighter';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { Tooltip } from 'react-tooltip';
import { MatchedTypeDisplay } from './matched-terms-display';

interface Props {
	id: string;
}

export function Feature( { id }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const { features, products } = useAppSelector( selectNormalizedReportingConfig );
	const productId = useAppSelector( selectProductIdForFeature( id ) );
	const productName = productId ? products[ productId ].name : 'Unknown';
	const { name: featureName } = features[ id ];
	const { description } = features[ id ];

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

	const matchedDisplay = (
		<>
			<MatchedTypeDisplay entityId={ id } entityType={ 'features' } />
		</>
	);

	const safeId = replaceSpaces( id );
	const featureNameId = `feature_name_${ safeId }`;
	const descriptionId = `description_${ safeId }`;

	return (
		<>
			<button
				role="option"
				type="button"
				aria-selected={ isSelected }
				className={ classNames.join( ' ' ) }
				onClick={ handleFeatureSelect }
				aria-describedby={ descriptionId }
			>
				<div>
					<span id={ featureNameId }>
						<SearchHighlighter>{ featureName }</SearchHighlighter>
					</span>

					{ matchedDisplay }
				</div>
			</button>

			<Tooltip
				// Can't use #ID because some characters in IDs may not be safe for that syntax.
				anchorSelect={ `[id='${ featureNameId }']` }
				delayShow={ 1000 }
				className={ styles.tooltip }
				content={ description }
				place="right"
			/>
			<span hidden={ true } id={ descriptionId }>
				{ description }
			</span>
		</>
	);
}
