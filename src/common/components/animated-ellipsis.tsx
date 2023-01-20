import React from 'react';
import styles from './animated-ellipsis.module.css';

export function AnimatedEllipsis() {
	return (
		<div className={ styles.wrapper }>
			<div className={ styles.dot }></div>
			<div className={ styles.dot }></div>
			<div className={ styles.dot }></div>
		</div>
	);
}
