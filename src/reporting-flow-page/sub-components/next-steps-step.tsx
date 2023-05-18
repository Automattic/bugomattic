import React, { ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAllTasksAreComplete } from '../../combined-selectors/all-tasks-are-complete';
import { selectTaskIdsForIssueDetails } from '../../combined-selectors/relevant-task-ids';
import { selectIssueFeatureId, selectIssueType } from '../../issue-details/issue-details-slice';
import { NextSteps } from '../../next-steps/next-steps';
import { selectActiveReportingStep } from '../active-reporting-step-slice';
import { StepContainer } from './step-container';
import { ReactComponent as MissingInfoIllustration } from '../../common/svgs/missing-info-illustration.svg';
import styles from '../reporting-flow-page.module.css';
import { startOver } from '../../start-over/start-over-counter-slice';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { useLoggerWithCache } from '../../monitoring/use-logger-with-cache';
import { MoreInfo } from '../../next-steps/more-info';
import { updateHistoryWithState } from '../../url-history/actions';
import { PrimaryButton } from '../../common/components';

interface Props {
	stepNumber: number;
}

export function NextStepsStep( { stepNumber }: Props ) {
	const monitoringClient = useMonitoring();
	const relevantTaskIds = useAppSelector( selectTaskIdsForIssueDetails );
	const allTasksAreComplete = useAppSelector( selectAllTasksAreComplete );
	const issueFeatureId = useAppSelector( selectIssueFeatureId );
	const issueType = useAppSelector( selectIssueType );
	const activeStep = useAppSelector( selectActiveReportingStep );

	const tasksExist = relevantTaskIds.length > 0;
	const requiredInfoIsMissing =
		( issueFeatureId === null || issueType === 'unset' ) && activeStep === 'next-steps';
	const noTasksAreConfigured = ! tasksExist && activeStep === 'next-steps';

	const memoizedLogError = useLoggerWithCache( monitoringClient.logger.error, [
		issueFeatureId,
		issueType,
	] );

	let stepContentDisplay: ReactNode;
	if ( tasksExist ) {
		stepContentDisplay = <NextSteps />;
	} else if ( requiredInfoIsMissing ) {
		stepContentDisplay = <MissingRequiredInfoWarning />;
	} else if ( noTasksAreConfigured ) {
		stepContentDisplay = <NoTasksConfiguredWarning />;
		memoizedLogError( 'Encountered an issue reporting configuration with no tasks', {
			featureId: issueFeatureId,
			issueType,
		} );
	} else {
		stepContentDisplay = null;
	}

	// It's a no-op since we don't use the edit button in this step!
	const onEdit = useCallback( () => {
		return;
	}, [] );

	const isComplete = tasksExist && allTasksAreComplete;

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

function MissingRequiredInfoWarning() {
	const dispatch = useAppDispatch();
	const handleStartOverClick = () => {
		dispatch( startOver() );
		// We stay on the same page, just restarting the reporting flow!
		dispatch( updateHistoryWithState() );
	};
	return (
		<div role="alert" className={ styles.badStateWrapper }>
			<MissingInfoIllustration className={ styles.badStateImage } aria-hidden="true" />
			<h4 className={ styles.badStateHeader }>Hmm, we seem to be missing some information.</h4>
			<p className={ styles.badStateMessage }>
				This almost always means we could not parse the info in the URL. Please start over by
				clicking the button below.
			</p>
			<PrimaryButton onClick={ handleStartOverClick } className={ styles.startOverButton }>
				Start Over
			</PrimaryButton>
		</div>
	);
}

function NoTasksConfiguredWarning() {
	return (
		<>
			<div role="alert" className={ styles.badStateWrapper }>
				<MissingInfoIllustration className={ styles.badStateImage } aria-hidden="true" />
				<h4 className={ styles.badStateHeader }>
					Hmm, it appears this feature area has no issue reporting configuration.
				</h4>
				<p className={ styles.badStateMessage }>
					We have been notified and will correct this soon! In the meantime, you can try contacting
					the product team directly.
				</p>
			</div>
			<MoreInfo />
		</>
	);
}
