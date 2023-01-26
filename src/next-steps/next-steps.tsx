import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectRelevantTaskIds } from '../combined-selectors/relevant-task-ids';
import { Task } from './sub-components/task';
import styles from './next-steps.module.css';
import { MoreInfo } from './sub-components/more-info';
import Confetti from 'react-confetti';
import { selectIssueFeatureId } from '../issue-details/issue-details-slice';
import { selectAllTasksAreComplete } from '../combined-selectors/all-tasks-are-complete';

export function NextSteps() {
	const sectionRef = useRef< HTMLElement >( null );
	const [ sectionWidth, setSectionWidth ] = useState( 0 );
	const [ sectionHeight, setSectionHeight ] = useState( 0 );
	const [ showConfetti, setShowConfetti ] = useState( false );

	const issueFeatureId = useAppSelector( selectIssueFeatureId );
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );
	const allTasksAreComplete = useAppSelector( selectAllTasksAreComplete );

	const updateSizes = () => {
		if ( sectionRef.current ) {
			setSectionWidth( sectionRef.current.clientWidth );
			setSectionHeight( sectionRef.current.clientHeight );
		}
	};

	useEffect( () => {
		if ( allTasksAreComplete ) {
			setShowConfetti( true );
		} else {
			setShowConfetti( false );
		}
	}, [ allTasksAreComplete ] );

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

	return (
		<section ref={ sectionRef } className={ styles.sectionWrapper }>
			{ showConfetti && (
				<Confetti
					aria-hidden={ true }
					data-testid="confetti"
					height={ sectionHeight }
					width={ sectionWidth }
					recycle={ false }
					initialVelocityY={ { min: 0, max: 20 } }
					onConfettiComplete={ handleConfettiComplete }
				/>
			) }
			<ol aria-label="Steps to report issue" className={ styles.taskList }>
				{ relevantTaskIds.map( ( taskId ) => (
					<Task key={ taskId } taskId={ taskId } />
				) ) }
			</ol>
			<MoreInfo />
		</section>
	);
}
