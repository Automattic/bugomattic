import words from 'lodash.words';

export function includesIgnoringCase( string: string, substring: string ): boolean {
	return string.toUpperCase().includes( substring.toUpperCase() );
}

export function replaceSpaces( string: string, replacementCharacter = '_' ): string {
	return string.replaceAll( / /g, replacementCharacter );
}

export function tokenizeAndNormalize( string: string ) {
	// Add more stop words as needed
	const stopWords = new Set( [ 'a', 'an', 'and', 'the', 'in', 'on', 'at', 'of', 'this', 'to' ] );

	// The lodash 'words' function does a really nice job just as is!
	const allWords = words( string.toLowerCase() );
	return allWords.filter( ( word ) => ! stopWords.has( word ) );
}

export function escapeStringForRegex( string: string ) {
	return string.replace( /[\\^$.*+?()[\]{}|]/g, '\\$&' );
}
