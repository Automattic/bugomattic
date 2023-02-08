import React from 'react';
import styles from './app-header.module.css';
import { ReactComponent as HeaderLogo } from './header-logo.svg';

export function AppHeader() {
	return (
		<header className={ styles.wrapper }>
			<a href={ globalThis.location.pathname }>
				<h1 className={ styles.heading }>
					<HeaderLogo role="img" />
				</h1>
			</a>
		</header>
	);
}
