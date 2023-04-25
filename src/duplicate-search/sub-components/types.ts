// Effectively a Set, but using a plain object for easier React state updates.
// We use a set/object for more performant lookup.
export interface ActiveRepos {
	[ repoName: string ]: true;
}
