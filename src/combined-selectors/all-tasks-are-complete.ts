import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { selectCompletedTasks } from '../next-steps/completed-tasks-slice';
import { selectTaskIdsForCurrentIssueDetails } from './relevant-task-ids';

export const selectAllTasksAreComplete = createSelector(
	[ selectTaskIdsForCurrentIssueDetails, selectCompletedTasks ],
	( relevantTaskIds, completedTaskIds ) => {
		return allTasksAreComplete( relevantTaskIds, completedTaskIds );
	}
);

export const makeSelectorToPredictCompletingAllTasks = () =>
	createSelector(
		[
			selectTaskIdsForCurrentIssueDetails,
			selectCompletedTasks,
			( _state: RootState, currentTaskId: string ) => currentTaskId,
		],
		( relevantTaskIds, completedTaskIds, currentTaskId ) => {
			const expectedCompletedTasks = [ ...completedTaskIds, currentTaskId ];
			return allTasksAreComplete( relevantTaskIds, expectedCompletedTasks );
		}
	);

function allTasksAreComplete( relevantTaskIds: string[], completedTaskIds: string[] ) {
	const completedTaskIdsSet = new Set( completedTaskIds );
	for ( const taskId of relevantTaskIds ) {
		if ( ! completedTaskIdsSet.has( taskId ) ) {
			return false;
		}
	}
	return true;
}
