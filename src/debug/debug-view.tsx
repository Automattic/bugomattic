import React from 'react';
import styles from './debug-view.module.css';

interface Props {
	data: any;
	header: string;
}

export function DebugView( { data, header }: Props ) {
	const output = JSON.stringify( data, null, 4 );

	return (
		<div>
			<h2>{ header }:</h2>
			<pre className={ styles.debugData }>{ output }</pre>
		</div>
	);
}
