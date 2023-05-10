import { RootState } from '../../app/store';
import { queryToState, stateToQuery } from '../parsers';

describe( 'url-history-parsers', () => {
	test( 'Parsing state to query params and back preserves tracked top level state keys', () => {
		const startingState: RootState = {
			activePage: 'reportingFlow',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			reportingConfig: { foo: 'bar' } as any,
			availableRepoFilters: {
				repos: [ 'ignored' ],
				loadError: 'ignored',
			},
			activeReportingStep: 'type',
			issueDetails: {
				issueType: 'bug',
				featureId: 'test_feature_id',
				issueTitle: 'fake title',
			},
			featureSelectorForm: {
				searchTerm: 'should be ignored',
				selectedFeatureId: 'ignored_feature_id',
			},
			completedTasks: [ 'completed_task_id_1', 'completed_task_id_2' ],
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			duplicateResults: [ 'should be ignored' ] as any,
			duplicateSearch: {
				searchTerm: 'Test search term',
				activeRepoFilters: [ 'test_repo_1', 'test_repo_2' ],
				sort: 'date-created',
				statusFilter: 'open',
			},
			startOverCounter: 0,
		};

		const serializedAndReparsedState = queryToState( stateToQuery( startingState ) );
		const expectedOutput: Partial< RootState > = {
			activePage: startingState.activePage,
			activeReportingStep: startingState.activeReportingStep,
			issueDetails: startingState.issueDetails,
			completedTasks: startingState.completedTasks,
			duplicateSearch: startingState.duplicateSearch,
		};
		expect( serializedAndReparsedState ).toEqual( expectedOutput );
	} );
} );
