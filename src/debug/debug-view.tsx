import React from 'react';
import { useAppSelector } from '../app';
import { selectReportingConfig } from '../reporting-config';
import styles from './debug-view.module.css';

export function DebugView() {
	const reportingConfig = useAppSelector( selectReportingConfig );
	const output = JSON.stringify( reportingConfig, null, 4 );

	return (
		<div className={ styles.content }>
			<pre>{ output }</pre>
		</div>
	);
}
