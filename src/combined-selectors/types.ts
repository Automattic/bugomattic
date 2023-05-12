export type MatchOption = NameMatch | KeywordMatch | DescriptionMatch | ChildMatch;
export type MatchType = MatchOption[ 'matchType' ];

export interface ChildMatch {
	matchType: 'child';
}

export interface NameMatch {
	matchType: 'name';
}

export interface KeywordMatch {
	matchType: 'keyword';
	keyword: string;
}

export interface DescriptionMatch {
	matchType: 'description';
}

interface Matches {
	[ entityId: string ]: MatchOption;
}

export interface ReportingConfigSearchResults {
	products: Matches;
	featureGroups: Matches;
	features: Matches;
}
