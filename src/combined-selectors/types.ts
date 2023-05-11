export interface ReportingConfigSearchResults {
	products: Set< string >;
	featureGroups: Set< string >;
	features: Set< string >;
	descriptionMatchedTerms: Record< string, Record< string, Set< string > > >;
}
