import React, { ReactNode } from 'react';
import { useAppSelector } from '../../app/hooks';
import { Pill } from '../../common/components';
import { selectReportingConfigSearchResults } from '../../combined-selectors/reporting-config-search-results';
import { ReactComponent as MatchIcon } from '../../common/svgs/match.svg';
import styles from './../feature-selector-form.module.css';

interface Props {
	entityId: string;
	entityType: 'features' | 'featureGroups' | 'products';
}

export function MatchedTypeDisplay( { entityId, entityType }: Props ) {
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	const entityMatch = searchResults[ entityType ][ entityId ];

	let matchedDisplay: ReactNode = null;

	if (
		entityMatch &&
		( entityMatch.matchType === 'keyword' || entityMatch.matchType === 'description' )
	) {
		matchedDisplay = (
			<span className={ styles.matchedTypeWrapper }>
				<Pill key={ entityId } pillClassName={ styles.matchedPill }>
					<MatchIcon
						data-testid="search-match-icon"
						aria-hidden={ true }
						className={ styles.appIcon }
					/>
					<span
						data-testid="search-matched-type"
						className={ styles.searchMatchedType }
					>{ `${ entityMatch.matchType } match` }</span>
				</Pill>
			</span>
		);
	}
	return matchedDisplay;
}
