import { ApiClient, useApi } from '../api';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import { ReportingConfig } from './types';
import { ReportingConfigContext } from './context';
import { createReportingConfig } from './create-reporting-config';

interface Props {
	children: ReactNode;
}

export const ReportingConfigProvider: FC< Props > = ( { children } ) => {
	const apiClient = useApi();
	const [ reportingConfig, setReportingConfig ] = useState< ReportingConfig >();

	useEffect( () => {
		const loadReportingConfig = async () => {
			if ( ! apiClient ) {
				return;
			}
			try {
				const response = await apiClient.loadReportingConfig();
				const reportingConfig = createReportingConfig( response );
				setReportingConfig( reportingConfig );
			} catch ( error ) {
				// TODO: Do something
				console.error( error );
			}
		};

		loadReportingConfig();
	}, [ apiClient ] );

	return (
		<ReportingConfigContext.Provider value={ reportingConfig }>
			{ children }
		</ReportingConfigContext.Provider>
	);
};
