import React from 'react';
import styles from './primary-button.module.css';

interface Props {
	onClick?: () => void;
	children: string;
	looksDisabled: boolean;
}

export function PrimaryButton( { children, onClick, looksDisabled }: Props ) {
	const classNames = [ styles.button ];
	if ( looksDisabled ) {
		classNames.push( styles.looksDisabled );
	}

	return (
		<button className={ classNames.join( ' ' ) } onSubmit={ onClick }>
			{ children }
		</button>
	);
}
