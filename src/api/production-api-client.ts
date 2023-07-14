import { LoggerApiClient, LogPayload } from '../monitoring/types';
import { getSearchIssuesCache, setSearchIssuesCache } from './shared-helpers/search-issues-cache';
import {
	ApiClient,
	AvailableRepoFiltersApiResponse,
	ReportingConfigApiResponse,
	SearchIssueApiResponse,
	SearchIssueOptions,
} from './types';

class ProductionApiClient implements ApiClient, LoggerApiClient {
	private nonce: string;
	private nonceHeaderName: string;

	constructor() {
		this.nonce = globalThis.nonce;
		this.nonceHeaderName = globalThis.nonceHeaderName;
	}

	async loadReportingConfig(): Promise< ReportingConfigApiResponse > {
		const cachedData = localStorage.getItem( 'cachedReportingConfigData' );
		const cacheExpiry = localStorage.getItem( 'cacheExpiry' );
		if ( cachedData && cacheExpiry && Date.now() < +cacheExpiry ) {
			return JSON.parse( cachedData );
		}

		const request = new Request( '/wp-json/bugomattic/v1/reporting-config/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: new Headers( {
				[ this.nonceHeaderName ]: this.nonce,
			} ),
		} );
		const response = await fetch( request );

		if ( response.ok ) {
			const data = await response.json();

			const cacheExpiryTime = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
			safelySetLocalstorageCache( 'cachedReportingConfigData', JSON.stringify( data ) );
			safelySetLocalstorageCache( 'cacheExpiry', cacheExpiryTime.toString() );

			return data;
		} else {
			throw new Error(
				`Load Reporting Config web request failed with status code ${
					response.status
				}. Response body: ${ JSON.stringify( await response.json() ) }`
			);
		}
	}

	async log( payload: LogPayload ) {
		const request = new Request( '/wp-json/bugomattic/v1/logs/', {
			method: 'POST',
			credentials: 'same-origin',
			headers: new Headers( {
				'Content-Type': 'application/json',
				[ this.nonceHeaderName ]: this.nonce,
			} ),
			body: JSON.stringify( payload ),
		} );
		const response = await fetch( request );

		if ( ! response.ok ) {
			throw new Error(
				`Log web request failed with status code ${
					response.status
				}. Response body: ${ JSON.stringify( await response.json() ) }`
			);
		}
	}

	async loadAvailableRepoFilters(): Promise< AvailableRepoFiltersApiResponse > {
		const repoFiltersCacheKey = 'repoFilters';
		const repoFiltersCacheExpiryKey = 'repoFiltersExpiry';
		const cachedData = localStorage.getItem( repoFiltersCacheKey );
		const cacheExpiry = localStorage.getItem( repoFiltersCacheExpiryKey );

		if ( cachedData && cacheExpiry && Date.now() < +cacheExpiry ) {
			return JSON.parse( cachedData );
		}

		const request = new Request( '/wp-json/bugomattic/v1/repos/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: new Headers( {
				[ this.nonceHeaderName ]: this.nonce,
			} ),
		} );
		const response = await fetch( request );

		if ( response.ok ) {
			const repoFilters = await response.json();

			const newCacheExpiry = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days -- these really won't change often

			safelySetLocalstorageCache( repoFiltersCacheKey, JSON.stringify( repoFilters ) );
			safelySetLocalstorageCache( repoFiltersCacheExpiryKey, newCacheExpiry.toString() );

			return repoFilters;
		} else {
			throw new Error(
				`Get Repo Filters web request failed with status code ${
					response.status
				}. Response body: ${ JSON.stringify( await response.json() ) }`
			);
		}
	}

	async searchIssues(
		search: string,
		options?: SearchIssueOptions
	): Promise< SearchIssueApiResponse > {
		const cachedData = getSearchIssuesCache( { search, options } );
		if ( cachedData ) {
			return cachedData;
		}

		const queryParams = new URLSearchParams();
		queryParams.set( 'search', search );
		if ( options?.sort ) {
			queryParams.set( 'sort', options.sort );
		}
		if ( options?.status ) {
			queryParams.set( 'status', options.status );
		}
		if ( options?.repos ) {
			for ( const repo of options.repos ) {
				queryParams.append( 'repos[]', repo );
			}
		}

		const request = new Request( `/wp-json/bugomattic/v1/issues/?${ queryParams.toString() }`, {
			method: 'GET',
			credentials: 'same-origin',
			headers: new Headers( {
				[ this.nonceHeaderName ]: this.nonce,
			} ),
		} );
		const response = await fetch( request );

		if ( response.ok ) {
			const issues = await response.json();
			setSearchIssuesCache( { search, options }, issues );
			return issues;
		} else {
			throw new Error(
				`Search Issues web request failed with status code ${
					response.status
				}. Response body: ${ JSON.stringify( await response.json() ) }`
			);
		}
	}
}

export function createProductionApiClient(): ApiClient & LoggerApiClient {
	const productionApiClient = new ProductionApiClient();
	return {
		loadReportingConfig: productionApiClient.loadReportingConfig.bind( productionApiClient ),
		log: productionApiClient.log.bind( productionApiClient ),
		loadAvailableRepoFilters:
			productionApiClient.loadAvailableRepoFilters.bind( productionApiClient ),
		searchIssues: productionApiClient.searchIssues.bind( productionApiClient ),
	};
}

function safelySetLocalstorageCache( key: string, value: string ) {
	try {
		localStorage.setItem( key, value );
	} catch ( err ) {
		// Caching should never bubble up errors -- it's just a performance optimization!
		// The most likely thing we'd hit when caching is a QuotaExceededError.
		// So let's just leave a gentle console message about the user being able to add a perfomrance boost.
		console.info(
			`Unable to set cache value for ${ key }. ` +
				`This likely means there is too much in localstorage for this website. ` +
				`Consider deleting unused data from localstorage -- it will speed up performance on this site! `
		);
	}
}
