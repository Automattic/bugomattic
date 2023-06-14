import words from 'lodash.words';
import { removeStopwords } from 'stopword';

export function includesIgnoringCase( string: string, substring: string ): boolean {
	return string.toUpperCase().includes( substring.toUpperCase() );
}

export function replaceSpaces( string: string, replacementCharacter = '_' ): string {
	return string.replaceAll( / /g, replacementCharacter );
}

export function tokenizeAndNormalize( string: string ) {
	// The lodash 'words' function does a really nice job just as is for word splitting!
	const allWords = words( string.toLowerCase() );
	return removeStopwords( allWords );
}

export function escapeStringForRegex( string: string ) {
	return string.replace( /[\\^$.*+?()[\]{}|]/g, '\\$&' );
}
