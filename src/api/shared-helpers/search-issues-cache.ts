import { SearchIssueApiResponse, SearchIssueOptions } from '../types';

interface SearchIssuesCache {
	[ serializedParams: string ]: SearchIssueApiResponse;
}

interface SearchParams {
	search: string;
	options?: SearchIssueOptions;
}

const MAX_CACHE_SIZE = 25;

export const searchIssuesCache: SearchIssuesCache = {};
const cacheKeyQueue: string[] = [];

export function getSearchIssuesCache( {
	search,
	options,
}: SearchParams ): SearchIssueApiResponse | undefined {
	const serializedParams = JSON.stringify( { search, options } );
	return searchIssuesCache[ serializedParams ];
}

export function setSearchIssuesCache(
	{ search, options }: SearchParams,
	response: SearchIssueApiResponse
): void {
	const serializedParams = JSON.stringify( { search, options } );
	if ( cacheKeyQueue.length >= MAX_CACHE_SIZE ) {
		const oldestCacheKey = cacheKeyQueue.shift();
		if ( oldestCacheKey ) {
			delete searchIssuesCache[ oldestCacheKey ];
		}
	}
	searchIssuesCache[ serializedParams ] = response;
	cacheKeyQueue.push( serializedParams );
}
