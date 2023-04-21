import React, { useEffect, useMemo } from 'react';
import styles from '../duplicate-search-controls.module.css';
import { useAppSelector } from '../../app/hooks';
import {
	selectAvailableRepoFilters,
	selectAvailableRepoFiltersLoadError,
} from '../../static-data/available-repo-filters/available-repo-filters-slice';
import { useMonitoring } from '../../monitoring/monitoring-provider';
import { useLoggerWithCache } from '../../monitoring/use-logger-with-cache';
import { ActiveRepos } from './types';

interface Props {
	activeRepos: ActiveRepos;
	setActiveRepos: ( activeRepos: ActiveRepos ) => void;
}

interface ReposByOrg {
	[ org: string ]: string[];
}

export function ManualRepoFilter( { activeRepos, setActiveRepos }: Props ) {
	const availableRepos = useAppSelector( selectAvailableRepoFilters );

	const sortedAvailableRepos = useMemo( () => [ ...availableRepos ].sort(), [ availableRepos ] );

	const availableReposByOrg: ReposByOrg = useMemo( () => {
		return sortedAvailableRepos.reduce( ( reposByOrg: ReposByOrg, repo: string ) => {
			const [ org ] = repo.split( '/' );
			if ( ! reposByOrg[ org ] ) {
				reposByOrg[ org ] = [];
			}
			reposByOrg[ org ].push( repo );
			return reposByOrg;
		}, {} );
	}, [ sortedAvailableRepos ] );

	const createCheckboxChangeHandler =
		( repo: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const { checked } = event.target;
			let newActiveRepos: ActiveRepos;
			if ( checked ) {
				newActiveRepos = { ...activeRepos, [ repo ]: true };
			} else {
				newActiveRepos = { ...activeRepos };
				delete newActiveRepos[ repo ];
			}
			setActiveRepos( newActiveRepos );
		};

	const selectAllButton = (
		<button
			type="button"
			className={ styles.repoFilterMassActionButton }
			onClick={ () =>
				setActiveRepos(
					availableRepos.reduce( ( newActiveRepos: ActiveRepos, repo: string ) => {
						newActiveRepos[ repo ] = true;
						return newActiveRepos;
					}, {} )
				)
			}
		>
			Select all
		</button>
	);

	const deselectAllButton = (
		<button
			type="button"
			className={ styles.repoFilterMassActionButton }
			onClick={ () => setActiveRepos( {} ) }
		>
			Deselect all
		</button>
	);

	const massActionButton =
		Object.keys( activeRepos ).length === availableRepos.length
			? deselectAllButton
			: selectAllButton;

	// We handle static data errors in real time where they occur. This is where we need to handle any
	// potential repository filter load error.
	const monitoringClient = useMonitoring();
	const availableReposLoadError = useAppSelector( selectAvailableRepoFiltersLoadError );
	const logError = useLoggerWithCache( monitoringClient.logger.error, [] );
	useEffect( () => {
		if ( availableReposLoadError ) {
			logError( 'Error loading available repo filters', {
				error: availableReposLoadError,
			} );
		}
	}, [ availableReposLoadError, logError ] );

	if ( availableReposLoadError ) {
		return (
			<div>
				<h3 className="screenReaderOnly">Manual filter mode</h3>
				<p
					role="alert"
					className={ `${ styles.repoFilterModeDescription } ${ styles.repoFilterError } ` }
				>
					Uh oh! It looks like there was an error loading the list of available repository filters.
					We have logged this error and will fix it soon. In the meantime, you can still search for
					issues using the default filter mode.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h3 className="screenReaderOnly">Manual filter mode</h3>
			<p className={ styles.repoFilterModeDescription }>
				Restricts results to only the repositories selected.
			</p>
			{ massActionButton }
			<ul
				aria-label="List of repository filters by organization"
				className={ styles.repoFilterOrgList }
			>
				{ Object.entries( availableReposByOrg ).map( ( [ org, fullRepoNamesForOrg ] ) => (
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
											checked={ activeRepos[ fullRepoName ] ?? false }
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
