import React, { ReactNode, useCallback } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectAllTasksAreComplete } from '../../combined-selectors/all-tasks-are-complete';
import { selectRelevantTaskIds } from '../../combined-selectors/relevant-task-ids';
import { NextSteps } from '../../next-steps/next-steps';
import { StepContainer } from './step-container';

interface Props {
	stepNumber: number;
}

export function NextStepsStep( { stepNumber }: Props ) {
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );
	const allTasksAreComplete = useAppSelector( selectAllTasksAreComplete );

	// It's a no-op since we don't use the edit button in this step!
	const onEdit = useCallback( () => {
		return;
	}, [] );

	const tasksExist = relevantTaskIds.length > 0;

	const isComplete = tasksExist && allTasksAreComplete;

	let stepContentDisplay: ReactNode;
	if ( tasksExist ) {
		stepContentDisplay = <NextSteps />;
	} else {
		stepContentDisplay = null;
	}

	return (
		<StepContainer
			title="Next Steps"
			stepNumber={ stepNumber }
			isComplete={ isComplete }
			showEditButton={ false }
			onEdit={ onEdit }
		>
			{ stepContentDisplay }
		</StepContainer>
	);
}
