import { RootState } from '../app/store';

export function createFakeRootState( partialState: Partial< RootState > = {} ): RootState {
	const fakeDefaultRootState: RootState = {
		activePage: 'search-for-issues',
		availableRepoFilters: {
			repos: [],
			loadError: null,
		},
		reportingConfig: {
			loadError: null,
			indexed: {},
			normalized: {
				features: {},
				featureGroups: {},
				products: {},
				tasks: {},
			},
		},

		activeReportingStep: 'feature',
		completedTasks: [],
		featureSelectorForm: {
			searchTerm: '',
			selectedFeatureId: null,
		},
		issueDetails: {
			issueType: 'unset',
			featureId: null,
			issueTitle: '',
		},
		startOverCounter: 0,

		issueSearch: {
			searchTerm: '',
			activeRepoFilters: [],
			sort: 'relevance',
			statusFilter: 'all',
		},
		issueSearchResults: {
			results: [],
			requestStatus: 'fulfilled',
			requestError: null,
			currentRequestId: '',
		},
	};

	return {
		...fakeDefaultRootState,
		...partialState,
	};
}
