import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectTaskIdsForIssueDetails } from '../combined-selectors/relevant-task-ids';
import { Task } from './sub-components/task';
import styles from './next-steps.module.css';
import { MoreInfo } from './more-info';
import Confetti from 'react-confetti';
import { selectIssueFeatureId } from '../issue-details/issue-details-slice';
import { selectAllTasksAreComplete } from '../combined-selectors/all-tasks-are-complete';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { selectNormalizedReportingConfig } from '../static-data/reporting-config/reporting-config-slice';
import { StepSubheader } from '../common/components';

export function NextSteps() {
	const monitoringClient = useMonitoring();

	const sectionRef = useRef< HTMLElement >( null );
	const [ sectionWidth, setSectionWidth ] = useState( 0 );
	const [ sectionHeight, setSectionHeight ] = useState( 0 );
	const [ showConfetti, setShowConfetti ] = useState( false );

	const { tasks } = useAppSelector( selectNormalizedReportingConfig );
	const issueFeatureId = useAppSelector( selectIssueFeatureId );
	const relevantTaskIds = useAppSelector( selectTaskIdsForIssueDetails );
	const allTasksAreComplete = useAppSelector( selectAllTasksAreComplete );

	useEffect( () => {
		const sourcesInOrder = relevantTaskIds.map( ( taskId ) => {
			return {
				parentType: tasks[ taskId ].parentType,
				parentId: tasks[ taskId ].parentId,
			};
		} );

		monitoringClient.logger.debug(
			'Relevant tasks calculated for issue type and feature. See additional details for sourcing.',
			{ sourcesInOrder }
		);
	}, [ relevantTaskIds, tasks, monitoringClient.logger ] );

	const updateSizes = () => {
		if ( sectionRef.current ) {
			// If available, we want to calculate the width and height of the parent element,
			// which will the step container wrapping this section.
			// That lets us make the whole step feel like it has confetti!
			// If that's not available, let's fall back to the width and height of just this section.
			setSectionWidth(
				sectionRef.current.parentElement?.clientWidth ?? sectionRef.current.clientWidth
			);
			setSectionHeight(
				sectionRef.current.parentElement?.clientHeight ?? sectionRef.current.clientHeight
			);
		}
	};

	useEffect( () => {
		if ( allTasksAreComplete ) {
			setShowConfetti( true );
		} else {
			setShowConfetti( false );
		}
	}, [ allTasksAreComplete, monitoringClient.analytics ] );

	// On mount, we want to calculate the section size for the Confetti
	// We also want to recalculate whenever the relevant tasks change, or the selected feature
	// changes, as both can affect the overall size of this section.
	useEffect( () => {
		updateSizes();
	}, [ issueFeatureId, relevantTaskIds ] );

	// Finally, we want to recalculate on every window resize!
	useEffect( () => {
		globalThis.addEventListener( 'resize', updateSizes );
		return () => {
			globalThis.removeEventListener( 'resize', updateSizes );
		};
	} );

	const handleConfettiComplete = useCallback( () => {
		setShowConfetti( false );
	}, [] );

	const subheader = `Review the tasks listed below, carefully curated by the feature team. We've customized the links to speed up your reporting process.`;

	return (
		<section ref={ sectionRef }>
			{ showConfetti && (
				<Confetti
					aria-hidden={ true }
					data-testid="confetti"
					height={ sectionHeight }
					width={ sectionWidth }
					recycle={ false }
					initialVelocityY={ { min: 0, max: 15 } }
					onConfettiComplete={ handleConfettiComplete }
				/>
			) }

			<StepSubheader>{ subheader }</StepSubheader>
			<ol aria-label="Steps to report issue" className={ styles.taskList }>
				{ relevantTaskIds.map( ( taskId ) => (
					<Task key={ taskId } taskId={ taskId } />
				) ) }
			</ol>
			<MoreInfo />
		</section>
	);
}
