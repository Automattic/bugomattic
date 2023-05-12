export type MatchType = 'name' | 'keyword' | 'description';
export type MatchOption = NameMatch | KeywordMatch | DescriptionMatch;

interface NameMatch {
	matchType: 'name';
}

interface KeywordMatch {
	matchType: 'keyword';
	keyword: string;
}

interface DescriptionMatch {
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
