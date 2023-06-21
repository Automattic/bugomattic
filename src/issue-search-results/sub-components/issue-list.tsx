import React from 'react';
import { Issue } from '../types';
import { IssueResult } from './issue-result';
import styles from '../issue-search-results.module.css';

interface Props {
	issues: Issue[];
}

export function IssueList( { issues }: Props ) {
	return (
		<ol className={ styles.issueList } aria-label="Issue search results">
			{ issues.map( ( issue ) => (
				// The URL is always unique, so we can use it as a key.
				<IssueResult key={ issue.url } issue={ issue } />
			) ) }
		</ol>
	);
}
