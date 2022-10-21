import React from 'react';
import { LocalApiProvider } from '../api';
import { DebugView } from '../debug/debug-view';
import { ReportingConfigProvider } from '../reporting-config';
import styles from './app.module.css';

function App() {
	return (
		<LocalApiProvider>
			<ReportingConfigProvider>
				<div className={ styles.app }>
					<header className={ styles.appHeader }>
						<h1>Bugomattic (Ragnarok)</h1>
					</header>
					<main>
						<DebugView></DebugView>
					</main>
				</div>
			</ReportingConfigProvider>
		</LocalApiProvider>
	);
}

export default App;
