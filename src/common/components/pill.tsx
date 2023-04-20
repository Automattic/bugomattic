import React from 'react';
import styles from './pill.module.css';

interface Props {
	keyword: string;
}

export function Pill( { keyword }: Props ) {
	return (
		<span role="listitem" className={ styles.pill }>
			{ keyword }
		</span>
	);
}
