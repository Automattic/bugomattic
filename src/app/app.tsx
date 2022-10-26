import React, { useEffect } from 'react';
import { DebugView } from '../debug/debug-view';
import {
	loadReportingConfig,
	selectIndexedReportingConfig,
	selectNormalizedReportingConfig,
	selectReportingConfigLoadStatus,
} from '../reporting-config';
import styles from './app.module.css';
import { useAppDispatch, useAppSelector } from './hooks';

export function App() {
	const dispatch = useAppDispatch();

	const reportingConfigLoadStatus = useAppSelector( selectReportingConfigLoadStatus );
	const normalizedReportingConfig = useAppSelector( selectNormalizedReportingConfig );
	const indexedReportingConfig = useAppSelector( selectIndexedReportingConfig );

	const debugData = {
		normalizedReportingConfig,
		indexedReportingConfig,
	};

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
			<main className={ styles.content }>
				{ reportingConfigLoadStatus === 'loading' && <p>Reporting config is loading...</p> }
				<DebugView data={ debugData }></DebugView>
			</main>
		</div>
	);
}
