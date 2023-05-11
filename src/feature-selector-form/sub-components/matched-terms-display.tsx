import React from 'react';

import { Pill } from '../../common/components';
import { ReactComponent as MatchIcon } from '../../common/svgs/match.svg';
import styles from './../feature-selector-form.module.css';

interface Props {
	searchTerm: string;
	matchType: 'description' | 'keyword';
}

export function MatchedTermsDisplay( { matchType }: Props ) {
	return (
		<span className={ styles.termMatchesWrapper }>
			<Pill key={ matchType } highlightClassName={ styles.matchedPill }>
				<MatchIcon data-testid="match-icon" aria-hidden={ true } className={ styles.appIcon } />
				{ `${ matchType } match ` }
			</Pill>
		</span>
	);
}
