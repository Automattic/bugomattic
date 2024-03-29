export type IssueStatus = 'open' | 'closed';

export interface Issue {
	dateCreated: string;
	dateUpdated: string;
	title: string;
	url: string;
	repo: string;
	status: IssueStatus;
	author: string;
	content: string;
}

export interface IssueSearchResultsState {
	results: Issue[];
	requestStatus: 'pending' | 'fulfilled' | 'error';
	requestError: string | null;
	currentRequestId: string;
}
