import { DependencyList, useMemo } from 'react';
import { AdditionalLogDetails, LogFunction } from './types';

/**
 * Using a log function within a component can create a lot of spam on rerenders.
 * This function wraps a log function and caches the log arguments, and skips logging
 * if the log function has already been called with the same arguments.
 * We memoize so that the cache is preserved across rerenders.
 * This also gives control over how broad the cache is.
 */
export function useLoggerWithCache( log: LogFunction, dependencies: DependencyList ): LogFunction {
	return useMemo( () => {
		return createLoggerWithCache( log );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ log, ...dependencies ] );
}

function createLoggerWithCache( log: LogFunction ): LogFunction {
	const cache = new Set< string >();
	return ( message: string, additionalDetails?: AdditionalLogDetails ) => {
		const logDetails = `${ message }|${ JSON.stringify( additionalDetails ) }`;
		if ( cache.has( logDetails ) ) {
			return;
		}
		cache.add( logDetails );
		log( message, additionalDetails );
	};
}
