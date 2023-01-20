import React, { ReactNode, useCallback } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectRelevantTaskIds } from '../../combined-selectors/relevant-task-ids';
import { selectCompletedTasks } from '../../next-steps/completed-tasks-slice';
import { NextSteps } from '../../next-steps/next-steps';
import { StepContainer } from './step-container';

export function NextStepsStep() {
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );
	const completedTaskIds = useAppSelector( selectCompletedTasks );

	// It's a no-op since we don't use the edit button in this step!
	const onEdit = useCallback( () => {
		return;
	}, [] );

	const tasksExist = relevantTaskIds.length > 0;

	const allTasksAreComplete = () => {
		const completedTaskIdsSet = new Set( completedTaskIds );
		for ( const taskId of relevantTaskIds ) {
			if ( ! completedTaskIdsSet.has( taskId ) ) {
				return false;
			}
		}
		return true;
	};

	const isComplete = tasksExist && allTasksAreComplete();

	let stepContentDisplay: ReactNode;
	if ( tasksExist ) {
		stepContentDisplay = <NextSteps />;
	} else {
		stepContentDisplay = null;
	}

	return (
		<StepContainer
			title="Next Steps"
			stepNumber={ 3 }
			isComplete={ isComplete }
			showEditButton={ false }
			onEdit={ onEdit }
		>
			{ stepContentDisplay }
		</StepContainer>
	);
}
