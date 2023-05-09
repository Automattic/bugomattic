import React from 'react';
import { ReactComponent as ErrorIcon } from '../common/svgs/warning-triangle.svg';
import styles from './app-error.module.css';

export function AppErrorDisplay() {
	const headerId = 'app-error-header';
	return (
		<section aria-labelledby={ headerId } className={ styles.wrapper } role="alert">
			<ErrorIcon className={ styles.icon } aria-hidden={ true } />
			<h2 id={ headerId } className={ styles.header }>
				{ 'Uh oh! Something went wrong :(' }
			</h2>
			<p className={ styles.message }>
				{ "We're sorry that happened! We've logged an error and will look into it." }
			</p>
			<p className={ styles.message }>
				{ 'In the meantime, you can try refreshing the page or ' }
				<a href={ window.location.pathname }>returning to the start</a>
				{ '. You can also contact the Bugomattic administrators.' }
			</p>
		</section>
	);
}
