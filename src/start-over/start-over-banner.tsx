import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAllTasksAreComplete } from '../combined-selectors/all-tasks-are-complete';
import { selectRelevantTaskIds } from '../combined-selectors/relevant-task-ids';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { startOver } from './start-over-counter-slice';
import { updateHistoryWithState } from '../url-history/actions';
import { Banner } from '../common/components';
import { ReactComponent as ChecklistIllustration } from './checklist-illustration.svg';

export function StartOverBanner() {
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
		globalThis.scrollTo( 0, 0 );
		monitoringClient.analytics.recordEvent( 'start_over_click' );
	};

	const headers = [
		'Thank you for reporting the issue!',
		'We appreciate your issue report! Every bit helps!',
		'Thanks for helping improve our software!',
	];
	const randomIndex = Math.floor( Math.random() * headers.length );
	const header = headers[ randomIndex ];

	const actionButton = (
		<button onClick={ handleStartOverClick } className="primaryButton">
			Start Over
		</button>
	);

	return (
		<Banner
			aria-label="Start Over"
			illustration={ <ChecklistIllustration /> }
			header={ header }
			message={ 'Start over to report a new issue or go back to duplicate search' }
			actionButton={ actionButton }
		/>
	);
}
