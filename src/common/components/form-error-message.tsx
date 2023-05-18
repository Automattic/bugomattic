import React from 'react';
import { ReactComponent as ErrorIcon } from '../svgs/warning.svg';
import styles from './form-error-message.module.css';

interface Props {
	children: string;
}

export function FormErrorMessage( { children }: Props ) {
	return (
		<span role="alert" className={ styles.errorMessage }>
			<ErrorIcon aria-label="Error:" className={ styles.errorIcon } />
			{ children }
		</span>
	);
}
