import React from 'react';
import { AnimatedEllipsis } from '../common/components';
import styles from './reporting-config-loading-indicator.module.css';

export function ReportingConfigLoadingIndicator() {
	const messageId = 'loading-message';

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
			aria-live="assertive"
			aria-relevant="all"
			role="dialog"
			aria-labelledby={ messageId }
		>
			<span id={ messageId } className={ styles.message }>
				{ message }
			</span>
			<AnimatedEllipsis />
		</div>
	);
}
