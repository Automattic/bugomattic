import { RootState } from '../app/store';

export type UrlTrackedState = Pick< RootState, 'activeStep' | 'issueDetails' | 'completedTasks' >;
