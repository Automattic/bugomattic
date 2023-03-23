import { LoggerApiClient, LogPayload } from '../monitoring/types';
import {
	ApiClient,
	IssueApiResponse,
	ReportingConfigApiResponse,
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
			localStorage.setItem( 'cachedReportingConfigData', JSON.stringify( data ) );
			localStorage.setItem( 'cacheExpiry', cacheExpiryTime.toString() );

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

	async getRepoFilters(): Promise< string[] > {
		const request = new Request( '/wp-json/bugomattic/v1/repos/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: new Headers( {
				[ this.nonceHeaderName ]: this.nonce,
			} ),
		} );
		const response = await fetch( request );

		if ( response.ok ) {
			return response.json();
		} else {
			throw new Error(
				`Get Repo Filters web request failed with status code ${
					response.status
				}. Response body: ${ JSON.stringify( await response.json() ) }`
			);
		}
	}

	async searchIssues( search: string, options?: SearchIssueOptions ): Promise< IssueApiResponse > {
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
			return response.json();
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
		getRepoFilters: productionApiClient.getRepoFilters.bind( productionApiClient ),
		searchIssues: productionApiClient.searchIssues.bind( productionApiClient ),
	};
}
