import React from 'react';
import { Issue } from '../types';
import { IssueResult } from './issue-result';
import styles from '../duplciate-results.module.css';

interface Props {
	issues: Issue[];
}

export function IssueList( { issues }: Props ) {
	return (
		<ol className={ styles.issueList }>
			{ issues.map( ( issue ) => (
				<IssueResult key={ issue.url } issue={ issue } />
			) ) }
		</ol>
	);
}
