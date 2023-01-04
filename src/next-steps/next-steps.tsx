import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectRelevantTaskIds } from '../combined-selectors/relevant-task-ids';
import { Task } from './sub-components/task';
import styles from './next-steps.module.css';

export function NextSteps() {
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );

	const taskListDisplay = (
		<ol className={ styles.taskList }>
			{ relevantTaskIds.map( ( taskId ) => (
				<li key={ taskId }>
					<Task taskId={ taskId } />
				</li>
			) ) }
		</ol>
	);

	return <section>{ taskListDisplay }</section>;
}
