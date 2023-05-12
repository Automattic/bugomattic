import { SearchIssueApiResponse, SearchIssueOptions } from '../types';

interface SearchIssuesCache {
	[ serializedParams: string ]: SearchIssueApiResponse;
}

interface SearchParams {
	search: string;
	options?: SearchIssueOptions;
}

const MAX_CACHE_SIZE = 25;

let searchIssuesCache: SearchIssuesCache = {};
let cacheKeyQueue: string[] = [];

export function getSearchIssuesCache( {
	search,
	options,
}: SearchParams ): SearchIssueApiResponse | undefined {
	const serializedParams = serializeParams( { search, options } );
	return searchIssuesCache[ serializedParams ];
}

export function setSearchIssuesCache(
	{ search, options }: SearchParams,
	response: SearchIssueApiResponse
): void {
	const serializedParams = serializeParams( { search, options } );
	if ( cacheKeyQueue.length >= MAX_CACHE_SIZE ) {
		const oldestCacheKey = cacheKeyQueue.shift();
		if ( oldestCacheKey ) {
			delete searchIssuesCache[ oldestCacheKey ];
		}
	}
	searchIssuesCache[ serializedParams ] = response;
	cacheKeyQueue.push( serializedParams );
}

function serializeParams( params: SearchParams ): string {
	return JSON.stringify( params );
}

export function _clearSearchIssuesCache(): void {
	searchIssuesCache = {};
	cacheKeyQueue = [];
}
