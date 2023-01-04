import React from 'react';
import { ReactComponent as ErrorIcon } from '../svgs/warning.svg';
import styles from './form-error-message.module.css';

interface Props {
	children: string;
}

export function FormErrorMessage( { children }: Props ) {
	return (
		<span aria-live="assertive" className={ styles.errorMessage }>
			<ErrorIcon className={ styles.errorIcon } />
			{ children }
		</span>
	);
}
