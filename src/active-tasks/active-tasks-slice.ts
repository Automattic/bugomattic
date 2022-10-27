import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActiveTask, TaskIndex } from './types';

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
		setNewTasks( _, action: PayloadAction< ActiveTask[] > ) {
			return action.payload;
		},
	},
} );

export const activeTasksReducer = activeTasksSlice.reducer;
export const { toggleTask } = activeTasksSlice.actions;
