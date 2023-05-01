import React from 'react';
import styles from './pill.module.css';

interface Props {
	children: string | React.ReactNode;
	highlightClassName: string;
}

export function Pill( { children: content, highlightClassName }: Props ) {
	return (
		<span role="listitem" className={ `${ styles.pill } ${ highlightClassName }` }>
			{ content }
		</span>
	);
}
