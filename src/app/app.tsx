import React, { useEffect } from 'react';
import {
	loadReportingConfig,
	selectReportingConfigLoadStatus,
} from '../reporting-config/reporting-config-slice';
import { ReportingFlow } from '../reporting-flow/reporting-flow';
import styles from './app.module.css';
import { useAppDispatch, useAppSelector } from './hooks';

export function App() {
	const dispatch = useAppDispatch();

	const reportingConfigLoadStatus = useAppSelector( selectReportingConfigLoadStatus );

	useEffect( () => {
		if ( reportingConfigLoadStatus === 'empty' ) {
			dispatch( loadReportingConfig() );
		}
	}, [ reportingConfigLoadStatus, dispatch ] );

	return (
		<div className={ styles.app }>
			<header className={ styles.appHeader }>
				<h1>Bugomattic (Ragnarok)</h1>
			</header>
			<main>
				{ reportingConfigLoadStatus === 'loading' && <p>Reporting config is loading...</p> }
				<ReportingFlow />
			</main>
		</div>
	);
}
