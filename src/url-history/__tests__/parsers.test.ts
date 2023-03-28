import { RootState } from '../../app/store';
import { queryToState, stateToQuery } from '../parsers';

describe( 'url-history-parsers', () => {
	test( 'Parsing state to query params and back preserves tracked top level state keys', () => {
		const startingState: RootState = {
			activeReportingStep: 'typeTitle',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			reportingConfig: { foo: 'bar' } as any,
			issueDetails: {
				issueTitle: 'This is a test',
				issueType: 'bug',
				featureId: 'test_feature_id',
			},
			featureSelectorForm: {
				searchTerm: 'should be ignored',
				selectedFeatureId: 'ignored_feature_id',
			},
			completedTasks: [ 'completed_task_id_1', 'completed_task_id_2' ],
		};

		const serializedAndReparsedState = queryToState( stateToQuery( startingState ) );
		const expectedOutput: Partial< RootState > = {
			activeReportingStep: startingState.activeReportingStep,
			issueDetails: startingState.issueDetails,
			completedTasks: startingState.completedTasks,
		};
		expect( serializedAndReparsedState ).toEqual( expectedOutput );
	} );
} );
