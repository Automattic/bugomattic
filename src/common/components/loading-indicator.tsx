import React from 'react';
import { AnimatedEllipsis } from './animated-ellipsis';
import styles from './loading-indicator.module.css';

interface Props {
	message: string;
	ariaLabel?: string;
}

export function LoadingIndicator( { message, ariaLabel }: Props ) {
	return (
		<div className={ styles.wrapper } aria-relevant="all" role="alert" aria-label={ ariaLabel }>
			{ /* If there's an aria-label, we can hide the message so there's not duplicate similar messages. */ }
			<span className={ styles.message } aria-hidden={ ariaLabel ? 'true' : 'false' }>
				{ message }
			</span>
			<AnimatedEllipsis aria-hidden={ true } />
		</div>
	);
}
