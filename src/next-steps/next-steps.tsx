import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectRelevantTaskIds } from '../combined-selectors/relevant-task-ids';
import { Task } from './sub-components/task';
import styles from './next-steps.module.css';
import { MoreInfo } from './sub-components/more-info';

export function NextSteps() {
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );

	return (
		<section>
			<ol aria-label="Steps to report issue" className={ styles.taskList }>
				{ relevantTaskIds.map( ( taskId ) => (
					<Task key={ taskId } taskId={ taskId } />
				) ) }
			</ol>
			<MoreInfo />
		</section>
	);
}
