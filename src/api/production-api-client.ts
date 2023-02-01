import { LoggerApiClient, LogPayload } from '../monitoring/types';
import { ApiClient, ReportingConfigApiResponse } from './types';

export class ProductionApiClient implements ApiClient, LoggerApiClient {
	private nonce: string;
	private nonceHeaderName: string;

	constructor() {
		this.nonce = globalThis.nonce;
		this.nonceHeaderName = globalThis.nonceHeaderName;
	}

	async loadReportingConfig(): Promise< ReportingConfigApiResponse > {
		const request = new Request( '/wp-json/bugomattic/v1/reporting-config/', {
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
}
