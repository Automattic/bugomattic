import React from 'react';
import { AnimatedEllipsis } from '../common/components';
import styles from './reporting-config-loading-indicator.module.css';

export function ReportingConfigLoadingIndicator() {
	const messages = [
		'Finding some loving homes for bugs.',
		'"Hydrating config state" -- whatever that means!',
		"We're getting ready, be down in a hurry!",
	];

	const randomIndex = Math.floor( Math.random() * messages.length );

	const message = messages[ randomIndex ];

	return (
		<div
			className={ styles.wrapper }
			aria-relevant="all"
			role="alert"
			// For screen readers, let's be clear of the alert's intent.
			aria-label="Loading issue reporting configuration"
		>
			<span className={ styles.message }>{ message }</span>
			<AnimatedEllipsis aria-hidden={ true } />
		</div>
	);
}
