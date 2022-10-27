import { Task } from '../reporting-config';

export type EntityType = 'product' | 'featureGroup' | 'feature';

export interface SourcedTask {
	sourceId: string;
	sourceType: EntityType;
	details: Task;
}

export interface ActiveTask extends SourcedTask {
	completed: boolean;
}

export type TaskIndex = number;
