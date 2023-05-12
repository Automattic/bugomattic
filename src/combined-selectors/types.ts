export type MatchType = 'name' | 'keyword' | 'description' | 'child';
export type MatchOption = NameMatch | KeywordMatch | DescriptionMatch | ChildMatch;

interface ChildMatch {
	matchType: 'child';
}
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
	[ entityId: string ]: MatchOption;
}

export interface ReportingConfigSearchResults {
	products: Matches;
	featureGroups: Matches;
	features: Matches;
}
