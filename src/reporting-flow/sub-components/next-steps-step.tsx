import React, { ReactNode, useCallback } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectAllTasksAreComplete } from '../../combined-selectors/all-tasks-are-complete';
import { selectRelevantTaskIds } from '../../combined-selectors/relevant-task-ids';
import { selectIssueFeatureId, selectIssueType } from '../../issue-details/issue-details-slice';
import { NextSteps } from '../../next-steps/next-steps';
import { selectActiveStep } from '../active-step-slice';
import { StepContainer } from './step-container';
import styles from '../reporting-flow.module.css';

interface Props {
	stepNumber: number;
}

export function NextStepsStep( { stepNumber }: Props ) {
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );
	const allTasksAreComplete = useAppSelector( selectAllTasksAreComplete );
	const issueFeatureId = useAppSelector( selectIssueFeatureId );
	const issueType = useAppSelector( selectIssueType );
	const activeStep = useAppSelector( selectActiveStep );

	// It's a no-op since we don't use the edit button in this step!
	const onEdit = useCallback( () => {
		return;
	}, [] );

	const tasksExist = relevantTaskIds.length > 0;
	const requiredInfoIsMissing =
		( issueFeatureId === null || issueType === 'unset' ) && activeStep === 'nextSteps';
	const noTasksAreConfigured = ! tasksExist && activeStep === 'nextSteps';

	const isComplete = tasksExist && allTasksAreComplete;

	let stepContentDisplay: ReactNode;
	if ( tasksExist ) {
		stepContentDisplay = <NextSteps />;
	} else if ( requiredInfoIsMissing ) {
		stepContentDisplay = (
			<p className={ styles.badStateMessage } role="alert">
				Hmm, we seem to be missing some information. This almost always means we could not parse the
				info in the URL. Please start over by clicking the Bugomattic header at the top of the page.
			</p>
		);
	} else if ( noTasksAreConfigured ) {
		stepContentDisplay = (
			<p className={ styles.badStateMessage } role="alert">
				Hmm, it appears this feature area has no issue reporting configuration. We have been
				notified and will correct this soon! In the meantime, you can try contacting the product
				team directly.
			</p>
		);
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
