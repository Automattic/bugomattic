import React from 'react';
import { ReactComponent as LoadingIcon } from '../common/svgs/sync.svg';
import styles from './reporting-config-loading-indicator.module.css';

export function ReportingConfigLoadingIndicator() {
	const messageId = 'loading-message';
	return (
		<div
			className={ styles.wrapper }
			aria-live="assertive"
			aria-relevant="all"
			role="dialog"
			aria-labelledby={ messageId }
		>
			<LoadingIcon aria-hidden={ true } className={ styles.icon } />
			<span id={ messageId } className={ styles.message }>
				Loading issue reporting configuration...
			</span>
		</div>
	);
}
