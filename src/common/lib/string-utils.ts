export function includesIgnoringCase( string: string, substring: string ): boolean {
	return string.toUpperCase().includes( substring.toUpperCase() );
}

export function replaceSpaces( string: string, replacementCharacter = '_' ): string {
	return string.replaceAll( / /g, replacementCharacter );
}
