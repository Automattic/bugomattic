import React from 'react';
import { DebugView } from '../debug/debug-view';
import { createFromApiResponse } from '../reporting-config';
import styles from './app.module.css';
import fakeApiResponseJSON from '../api/local/local-reporting-config-response.json';
import { ReportingConfigApiResponse } from '../api';
import { useAppDispatch } from './hooks';

export function App() {
	const fakeApiResponse: ReportingConfigApiResponse =
		fakeApiResponseJSON as ReportingConfigApiResponse;

	const dispatch = useAppDispatch();
	dispatch( createFromApiResponse( fakeApiResponse ) );
	return (
		<div className={ styles.app }>
			<header className={ styles.appHeader }>
				<h1>Bugomattic (Ragnarok)</h1>
			</header>
			<main>
				<DebugView></DebugView>
			</main>
		</div>
	);
}
