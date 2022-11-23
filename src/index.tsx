import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App, setupStore } from './app';
import { Provider } from 'react-redux';
import { localApiClient, productionApiClient } from './api';
import { localMonitoringClient, MonitoringProvider } from './monitoring';

const root = ReactDOM.createRoot( document.getElementById( 'root' ) as HTMLElement );
const store = setupStore( productionApiClient );
root.render(
	<React.StrictMode>
		<MonitoringProvider monitoringClient={ localMonitoringClient }>
			<Provider store={ store }>
				<App />
			</Provider>
		</MonitoringProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// TODO: might not be a bad idea to add this in the future for local testing.
// reportWebVitals();
