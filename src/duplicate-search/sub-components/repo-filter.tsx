import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import {
	useFloating,
	autoUpdate,
	shift,
	useDismiss,
	useRole,
	useClick,
	useInteractions,
	FloatingFocusManager,
} from '@floating-ui/react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAvailableRepoFilters } from '../../static-data/available-repo-filters/available-repo-filters-slice';
import styles from '../duplicate-search-controls.module.css';
import {
	selectActiveRepoFilters,
	setActiveRepoFilters,
	setSearchParam,
} from '../duplicate-search-slice';
import { SegmentedControl } from '../../common/components';
import { DefaultRepoFilter } from './default-repo-filter';

type FilterMode = 'Default' | 'Manual';

export function RepoFilter() {
	const dispatch = useAppDispatch();

	const availableRepos = useAppSelector( selectAvailableRepoFilters );
	const savedActiveRepos = useAppSelector( selectActiveRepoFilters );
	const initialFilterMode: FilterMode = useMemo(
		() => ( savedActiveRepos.length === 0 ? 'Default' : 'Manual' ),
		[ savedActiveRepos ]
	);

	const [ workingActiveRepos, setWorkingActiveRepos ] = useState( savedActiveRepos );
	const [ filterMode, setFilterMode ] = useState< FilterMode >( initialFilterMode );

	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	const handlePopoverToggle = useCallback(
		( newIsPopoverOpenValue: boolean ) => {
			if ( newIsPopoverOpenValue ) {
				setWorkingActiveRepos( savedActiveRepos );
				setFilterMode( initialFilterMode );
			}
			setIsPopoverOpen( newIsPopoverOpenValue );
		},
		[ initialFilterMode, savedActiveRepos ]
	);

	const { x, y, refs, strategy, context } = useFloating( {
		placement: 'bottom-start',
		open: isPopoverOpen,
		onOpenChange: handlePopoverToggle,
		middleware: [ shift() ],
		whileElementsMounted: autoUpdate,
	} );

	const click = useClick( context );
	const dismiss = useDismiss( context );
	const role = useRole( context );

	const { getReferenceProps, getFloatingProps } = useInteractions( [ click, dismiss, role ] );

	const handleCancelClick = useCallback( () => {
		setIsPopoverOpen( false );
	}, [] );

	const handleFilterClick = useCallback( () => {
		const newRepoFilters = filterMode === 'Default' ? [] : workingActiveRepos;
		dispatch( setSearchParam( setActiveRepoFilters( newRepoFilters ) ) );
		setIsPopoverOpen( false );
	}, [ dispatch, filterMode, workingActiveRepos ] );

	let filterModeDisplay: ReactNode;
	if ( filterMode === 'Default' ) {
		filterModeDisplay = <DefaultRepoFilter />;
	} else {
		filterModeDisplay = (
			<RepoChecklist
				availableRepos={ availableRepos }
				activeRepos={ workingActiveRepos }
				setActiveRepos={ setWorkingActiveRepos }
			/>
		);
	}

	const filterModeOptions: FilterMode[] = [ 'Default', 'Manual' ];
	const handleSwitchModeClick = useCallback( ( newFilterMode: FilterMode ) => {
		setFilterMode( newFilterMode );
	}, [] );

	return (
		<>
			<button ref={ refs.setReference } { ...getReferenceProps() }>
				Repositories
			</button>
			{ isPopoverOpen && (
				<FloatingFocusManager context={ context } modal={ false }>
					<div
						className={ styles.repoPopoverWrapper }
						ref={ refs.setFloating }
						style={ {
							position: strategy,
							top: y ?? 0,
							left: x ?? 0,
						} }
						{ ...getFloatingProps() }
					>
						<div>
							<SegmentedControl
								options={ filterModeOptions }
								selectedOption={ filterMode }
								onSelect={ handleSwitchModeClick as ( option: string ) => void }
								controlId="repo-filter-mode"
								className={ styles.repoFilterModeControl }
							/>
							{ filterModeDisplay }
						</div>
						<div className={ styles.repoFilterButtonWrapper }>
							<button
								type="button"
								className={ styles.repoFilterCancelButton }
								onClick={ handleCancelClick }
							>
								Cancel
							</button>
							<button type="button" className="primaryButton" onClick={ handleFilterClick }>
								Filter
							</button>
						</div>
					</div>
				</FloatingFocusManager>
			) }
		</>
	);
}

interface RepoChecklistProps {
	availableRepos: string[];
	activeRepos: string[];
	setActiveRepos: ( activeRepos: string[] ) => void;
}

function RepoChecklist( { availableRepos, activeRepos, setActiveRepos }: RepoChecklistProps ) {
	const createCheckboxChangeHandler =
		( repo: string ) => ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const { checked } = event.target;
			const newActiveRepos = checked
				? [ ...activeRepos, repo ]
				: activeRepos.filter( ( activeRepo ) => activeRepo !== repo );
			setActiveRepos( newActiveRepos );
		};

	return (
		<ul>
			{ availableRepos.map( ( repo ) => (
				<li key={ repo }>
					<label>
						<input
							type="checkbox"
							checked={ activeRepos.includes( repo ) }
							onChange={ createCheckboxChangeHandler( repo ) }
						/>
						{ repo }
					</label>
				</li>
			) ) }
		</ul>
	);
}
