import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { updateStateFromHistory } from '../url-history/actions';

// This is just for additional clarity in the function signatures below!
type TaskId = string;

const initialState: TaskId[] = [];

export const completedTasksSlice = createSlice( {
	name: 'completedTasks',
	initialState: initialState,
	reducers: {
		addCompletedTask( state, action: PayloadAction< TaskId > ) {
			const completedTaskId = action.payload;
			if ( state.includes( completedTaskId ) ) {
				return state;
			}
			return [ ...state, completedTaskId ];
		},
		removeCompletedTask( state, action: PayloadAction< TaskId > ) {
			const taskIdToRemove = action.payload;
			if ( ! state.includes( taskIdToRemove ) ) {
				return state;
			}

			return state.filter( ( taskId ) => taskId !== taskIdToRemove );
		},
	},
	extraReducers: ( builder ) => {
		builder.addCase( updateStateFromHistory, ( state, action ) => {
			const completedTasks = action.payload.completedTasks;
			if ( ! completedTasks ) {
				return [ ...initialState ];
			}

			const filteredCompletedTasks = completedTasks.filter(
				( taskId ) => typeof taskId === 'string'
			);
			return [ ...filteredCompletedTasks ];
		} );
	},
} );

export const completedTasksReducer = completedTasksSlice.reducer;
export const { addCompletedTask, removeCompletedTask } = completedTasksSlice.actions;

export function selectCompletedTasks( state: RootState ): TaskId[] {
	return state.completedTasks;
}
