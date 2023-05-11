export type MatchType = NameMatch | KeywordMatch | DescriptionMatch;

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
	[ entityId: string ]: MatchType;
}

export interface ReportingConfigSearchResults {
	products: Matches;
	featureGroups: Matches;
	features: Matches;
}
