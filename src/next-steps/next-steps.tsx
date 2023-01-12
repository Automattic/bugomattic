import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectRelevantTaskIds } from '../combined-selectors/relevant-task-ids';
import { Task } from './sub-components/task';
import styles from './next-steps.module.css';

export function NextSteps() {
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );

	const taskListDisplay = (
		<ol aria-label="Steps to report issue" className={ styles.taskList }>
			{ relevantTaskIds.map( ( taskId ) => (
				<Task key={ taskId } taskId={ taskId } />
			) ) }
		</ol>
	);

	return <section>{ taskListDisplay }</section>;
}
