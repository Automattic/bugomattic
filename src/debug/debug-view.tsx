import React from 'react';
import styles from './debug-view.module.css';

interface Props {
	data: any;
}

export function DebugView( { data }: Props ) {
	const output = JSON.stringify( data, null, 4 );

	return (
		<div>
			<h2>Debug data:</h2>
			<pre className={ styles.debugData }>{ output }</pre>
		</div>
	);
}
