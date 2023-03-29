import React from 'react';
import { AnimatedEllipsis } from '../common/components';
import styles from './app.module.css';

export function AppLoadingIndicator() {
	const messages = [
		'Finding some loving homes for bugs.',
		'"Hydrating app data" -- whatever that means!',
		"We're getting ready, be down in a hurry!",
	];

	const randomIndex = Math.floor( Math.random() * messages.length );

	const message = messages[ randomIndex ];

	return (
		<div
			className={ styles.loadingWrapper }
			aria-relevant="all"
			role="alert"
			// For screen readers, let's be clear of the alert's intent.
			aria-label="Loading required app data"
		>
			<span className={ styles.loadingMessage }>{ message }</span>
			<AnimatedEllipsis aria-hidden={ true } />
		</div>
	);
}
