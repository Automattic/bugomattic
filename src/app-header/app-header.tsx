import React from 'react';
import styles from './app-header.module.css';
import { ReactComponent as BugLogo } from '../common/svgs/bug-logo.svg';

export function AppHeader() {
	return (
		<header className={ styles.wrapper }>
			<h1 className={ styles.heading }>
				<BugLogo className={ styles.logo } />
				Bugomattic
			</h1>
		</header>
	);
}
