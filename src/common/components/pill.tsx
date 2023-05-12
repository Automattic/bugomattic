import React from 'react';
import styles from './pill.module.css';

interface Props {
	children: string | React.ReactNode;
	pillClassName: string;
}

export function Pill( { children: content, pillClassName: pillClassName }: Props ) {
	return <span className={ `${ styles.pill } ${ pillClassName }` }>{ content }</span>;
}
