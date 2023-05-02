export function includesIgnoringCase( string: string, substring: string ): boolean {
	return string.toUpperCase().includes( substring.toUpperCase() );
}

export function replaceSpaces( string: string, replacementCharacter = '_' ): string {
	return string.replaceAll( / /g, replacementCharacter );
}

export function tokenizeAndNormalize( string: string ) {
	// Add more stop words as needed
	const stopWords = new Set( [ 'a', 'an', 'and', 'the', 'in', 'on', 'at', 'of', 'this', 'to' ] );
	return string
		.toLowerCase()
		.replace( /[^\w\s]|_/g, '' )
		.split( /\s+/ )
		.filter( ( word ) => ! stopWords.has( word ) );
}
