import React, { FC } from 'react';
import { useReportingConfig } from '../reporting-config';
import styles from './debug-view.module.css';

export const DebugView: FC = () => {
	const reportingConfig = useReportingConfig();

	const output = reportingConfig
		? JSON.stringify( reportingConfig, null, 4 )
		: 'Reporting config is loading.';
	return (
		<div className={ styles.content }>
			<pre>{ output }</pre>
		</div>
	);
};
