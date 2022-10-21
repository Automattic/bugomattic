import { useContext } from 'react';
import { ReportingConfigContext } from './context';

export function useReportingConfig() {
	return useContext( ReportingConfigContext );
}
