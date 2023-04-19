import React, { useMemo } from 'react';
import styles from '../duplicate-search-controls.module.css';

interface Props {
	availableRepos: string[];
	activeRepos: string[];
	setActiveRepos: ( activeRepos: string[] ) => void;
}

interface ReposByOrg {
	[ org: string ]: string[];
}

export function ManualRepoFilter( { availableRepos, activeRepos, setActiveRepos }: Props ) {
	const sortedAvailableRepos = useMemo( () => [ ...availableRepos ].sort(), [ availableRepos ] );

	const reposByOrg: ReposByOrg = useMemo( () => {
		const reposByOrg: ReposByOrg = {};
		sortedAvailableRepos.forEach( ( repo ) => {
			const [ org ] = repo.split( '/' );
			if ( ! reposByOrg[ org ] ) {
				reposByOrg[ org ] = [];
			}
			reposByOrg[ org ].push( repo );
		} );
		return reposByOrg;
	}, [ sortedAvailableRepos ] );

	const createCheckboxChangeHandler =
		( repo: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const { checked } = event.target;
			let newActiveRepos: string[];
			if ( checked ) {
				newActiveRepos = [ ...activeRepos, repo ];
			} else {
				newActiveRepos = activeRepos.filter( ( activeRepo ) => activeRepo !== repo );
			}
			setActiveRepos( newActiveRepos );
		};

	const selectAllButton = (
		<button
			type="button"
			className={ styles.repoFilterMassActionButton }
			onClick={ () => setActiveRepos( [ ...availableRepos ] ) }
		>
			Select all
		</button>
	);

	const deselectAllButton = (
		<button
			type="button"
			className={ styles.repoFilterMassActionButton }
			onClick={ () => setActiveRepos( [] ) }
		>
			Deselect all
		</button>
	);

	const massActionButton = activeRepos.length === 0 ? selectAllButton : deselectAllButton;

	return (
		<div>
			<p className={ styles.repoFilterModeDescription }>
				Restricts results to only the repositories selected.
			</p>
			{ massActionButton }
			<ul
				aria-label="List of repository filters by organization"
				className={ styles.repoFilterOrgList }
			>
				{ Object.entries( reposByOrg ).map( ( [ org, fullRepoNamesForOrg ] ) => (
					<li key={ org }>
						{ org }
						<ul
							aria-label={ `List of repositories for ${ org } organization` }
							className={ styles.repoFilterRepoList }
						>
							{ fullRepoNamesForOrg.map( ( fullRepoName ) => (
								<li key={ fullRepoName }>
									<label className={ styles.repoFilterCheckboxWrapper }>
										<input
											type="checkbox"
											checked={ activeRepos.includes( fullRepoName ) }
											onChange={ createCheckboxChangeHandler( fullRepoName ) }
											className={ styles.repoFilterCheckbox }
										/>
										{ /* While all the state handling uses the full repo names, for display here we don't need the org */ }
										{ fullRepoName.split( '/' )[ 1 ] }
									</label>
								</li>
							) ) }
						</ul>
					</li>
				) ) }
			</ul>
		</div>
	);
}
