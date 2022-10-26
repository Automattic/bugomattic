import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App, createStore } from './app';
import { Provider } from 'react-redux';
import { localApiClient } from './api';

const root = ReactDOM.createRoot( document.getElementById( 'root' ) as HTMLElement );
const store = createStore( localApiClient );
root.render(
	<React.StrictMode>
		<Provider store={ store }>
			<App />
		</Provider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

// TODO: might not be a bad idea to add this in the future for local testing.
// reportWebVitals();
