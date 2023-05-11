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

export function MatchedTermsDisplay( { entityId, entityType }: Props ) {
	const searchResults = useAppSelector( selectReportingConfigSearchResults );

	// Get the MatchType object for this entity
	const entityMatch = searchResults[ entityType ][ entityId ];

	let matchedDisplay: ReactNode = null;

	if (
		entityMatch &&
		( ( entityMatch.matchType === 'keyword' && entityType === 'features' ) ||
			entityMatch.matchType === 'description' )
	) {
		matchedDisplay = (
			<span className={ styles.termMatchesWrapper }>
				<Pill key={ entityId } highlightClassName={ styles.matchedPill }>
					<MatchIcon data-testid="match-icon" aria-hidden={ true } className={ styles.appIcon } />
					<span>{ `${ entityMatch.matchType } match` }</span>
				</Pill>
			</span>
		);
	}
	return matchedDisplay;
}
