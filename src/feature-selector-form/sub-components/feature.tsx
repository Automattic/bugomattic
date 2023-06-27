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

	const matchedDisplay = <MatchedTypeDisplay entityId={ id } entityType={ 'features' } />;

	const safeId = replaceSpaces( id );
	const descriptionId = `description_${ safeId }`;

	return (
		<>
			<button
				role="option"
				type="button"
				aria-selected={ isSelected }
				className={ styles.treeNode }
				onClick={ handleFeatureSelect }
				aria-describedby={ descriptionId }
			>
				<span
					className={ styles.treeNodeContentWrapper }
					data-tooltip-id="feature-tree-tooltip"
					data-tooltip-content={ description }
				>
					<span>
						<SearchHighlighter>{ featureName }</SearchHighlighter>
					</span>
					{ matchedDisplay }
				</span>
			</button>

			<span hidden={ true } id={ descriptionId }>
				{ description }
			</span>
		</>
	);
}
