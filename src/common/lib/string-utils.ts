export function includesIgnoringCase( string: string, substring: string ): boolean {
	return string.toUpperCase().includes( substring.toUpperCase() );
}
