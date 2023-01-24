import { createSelector } from '@reduxjs/toolkit';
import { selectCompletedTasks } from '../next-steps/completed-tasks-slice';
import { selectRelevantTaskIds } from './relevant-task-ids';

export const selectAllTasksAreComplete = createSelector(
	[ selectRelevantTaskIds, selectCompletedTasks ],
	( relevantTaskIds, completedTaskIds ) => {
		const completedTaskIdsSet = new Set( completedTaskIds );
		for ( const taskId of relevantTaskIds ) {
			if ( ! completedTaskIdsSet.has( taskId ) ) {
				return false;
			}
		}
		return true;
	}
);
