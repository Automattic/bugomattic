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
			<span className={ styles.message }>{ message }</span>
			<AnimatedEllipsis aria-hidden={ true } />
		</div>
	);
}
