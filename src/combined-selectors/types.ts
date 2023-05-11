export type MatchType = 'name' | 'keyword' | 'description';
export type MatchesOption = NameMatch | KeywordMatch | DescriptionMatch;

interface NameMatch {
	matchType: 'name';
}

interface KeywordMatch {
	matchType: 'keyword';
	keyword: string;
}

export interface DescriptionMatch {
	matchType: 'description';
	matchedTerms: Set< string >;
}

interface Matches {
	[ entityId: string ]: NameMatch | KeywordMatch | DescriptionMatch;
}

export interface ReportingConfigSearchResults {
	products: Matches;
	featureGroups: Matches;
	features: Matches;
}
