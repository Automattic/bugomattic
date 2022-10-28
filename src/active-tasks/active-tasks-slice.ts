import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app';
import { ActiveTask, SourcedTask, TaskIndex } from './types';

const initialState: ActiveTask[] = [];

export const activeTasksSlice = createSlice( {
	name: 'activeTasks',
	initialState: initialState,
	reducers: {
		toggleTask( state, action: PayloadAction< TaskIndex > ) {
			const taskIndex = action.payload;
			const newState = [ ...state ];
			newState[ taskIndex ].completed === ! state[ taskIndex ].completed;
			return newState;
		},
		setNewTasks( _, action: PayloadAction< SourcedTask[] > ) {
			const newTasks: ActiveTask[] = action.payload.map( ( task ) => {
				return {
					...task,
					completed: false,
				};
			} );
			return newTasks;
		},
	},
} );

export const activeTasksReducer = activeTasksSlice.reducer;
export const { toggleTask, setNewTasks } = activeTasksSlice.actions;

export function selectActiveTasks( state: RootState ): ActiveTask[] {
	return state.activeTasks;
}
