import React from 'react';
import styles from './step-subheader.module.css';

interface Props {
	children: string;
}

export function StepSubheader( { children }: Props ) {
	return (
		<p data-testid={ 'subheader' } className={ styles.subheader }>
			{ children }
		</p>
	);
}
