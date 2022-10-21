import { createContext } from 'react';
import { ReportingConfig } from './types';

export const ReportingConfigContext = createContext< ReportingConfig | undefined >( undefined );
