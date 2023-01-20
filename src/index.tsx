import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { setupStore } from './app/store';
import { App } from './app/app';
import { localMonitoringClient } from './monitoring/local-monitoring-client';
import { productionApiClient } from './api/production-api-client';
import { localApiClient } from './api/local-api-client';
import { MonitoringProvider } from './monitoring/monitoring-provider';
import { Fonts } from './fonts';

// TODO: use a production monitoring client when it's actually implemented fully.
const monitoringClient = isProduction() ? localMonitoringClient : localMonitoringClient;
const apiClient = isProduction() ? productionApiClient : localApiClient;
const store = setupStore( apiClient );

const root = ReactDOM.createRoot( document.getElementById( 'root' ) as HTMLElement );
root.render(
	<React.StrictMode>
		<MonitoringProvider monitoringClient={ monitoringClient }>
			<Provider store={ store }>
				<Fonts />
				<App />
			</Provider>
		</MonitoringProvider>
	</React.StrictMode>
);

function isProduction() {
	return process.env.NODE_ENV === 'production';
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// TODO: might not be a bad idea to add this in the future for local testing.
// reportWebVitals();
