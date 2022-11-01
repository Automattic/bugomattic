import { TaskDetails } from '../reporting-config';

export interface SourcedTask {
	sourceId: string;
	sourceType: string;
	details: TaskDetails;
}

export interface ActiveTask extends SourcedTask {
	completed: boolean;
}

export type TaskIndex = number;
