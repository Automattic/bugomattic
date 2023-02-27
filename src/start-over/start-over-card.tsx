import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAllTasksAreComplete } from '../combined-selectors/all-tasks-are-complete';
import { selectRelevantTaskIds } from '../combined-selectors/relevant-task-ids';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { startOver } from './start-over-action';
import { updateHistoryWithState } from '../url-history/actions';
import styles from './start-over-card.module.css';

export function StartOverCard() {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();

	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );
	const allTasksAreComplete = useAppSelector( selectAllTasksAreComplete );

	if ( relevantTaskIds.length === 0 || ! allTasksAreComplete ) {
		return null;
	}

	const handleStartOverClick = () => {
		dispatch( startOver() );
		dispatch( updateHistoryWithState() );
		monitoringClient.analytics.recordEvent( 'start_over_click' );
	};

	// TODO: Scroll back up to the top on click

	return (
		<section className={ styles.card } aria-label="Start Over">
			<p className={ styles.message }>Thank you for reporting the issue!</p>
			<button onClick={ handleStartOverClick } className="primaryButton">
				Start Over
			</button>
		</section>
	);
}
