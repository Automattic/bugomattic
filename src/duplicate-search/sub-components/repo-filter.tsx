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
import styles from '../duplicate-search-controls.module.css';
import {
	selectActiveRepoFilters,
	setActiveRepoFilters,
	setSearchParam,
} from '../duplicate-search-slice';
import { SegmentedControl } from '../../common/components';
import { DefaultRepoFilter } from './default-repo-filter';
import { ManualRepoFilter } from './manual-repo-filter';
import { ReactComponent as DownIcon } from '../../common/svgs/chevron-down.svg';
import { ReactComponent as FilterIcon } from '../../common/svgs/filter.svg';
import { ActiveRepos } from './types';

type FilterMode = 'Default' | 'Manual';

export function RepoFilter() {
	const dispatch = useAppDispatch();

	const savedActiveRepos = useAppSelector( selectActiveRepoFilters );

	const initialFilterMode: FilterMode = useMemo(
		() => ( savedActiveRepos.length === 0 ? 'Default' : 'Manual' ),
		[ savedActiveRepos ]
	);
	const [ filterMode, setFilterMode ] = useState< FilterMode >( initialFilterMode );

	const initialWorkingActiveRepos: ActiveRepos = useMemo(
		() =>
			savedActiveRepos.reduce( ( workingActiveRepos: ActiveRepos, repo: string ) => {
				workingActiveRepos[ repo ] = true;
				return workingActiveRepos;
			}, {} ),
		[ savedActiveRepos ]
	);
	const [ workingActiveRepos, setWorkingActiveRepos ] = useState( initialWorkingActiveRepos );

	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	const handlePopoverToggle = useCallback(
		( newIsPopoverOpenValue: boolean ) => {
			if ( newIsPopoverOpenValue ) {
				setWorkingActiveRepos( initialWorkingActiveRepos );
				setFilterMode( initialFilterMode );
			}
			setIsPopoverOpen( newIsPopoverOpenValue );
		},
		[ initialFilterMode, initialWorkingActiveRepos ]
	);

	const { x, y, refs, strategy, context, getReferenceProps, getFloatingProps } =
		usePopoverFloatingConfiguration( isPopoverOpen, handlePopoverToggle );

	const handleCancelClick = useCallback( () => {
		setIsPopoverOpen( false );
	}, [] );

	const handleFilterClick = useCallback( () => {
		const newRepoFilters = filterMode === 'Default' ? [] : Object.keys( workingActiveRepos );
		dispatch( setSearchParam( setActiveRepoFilters( newRepoFilters ) ) );
		setIsPopoverOpen( false );
	}, [ dispatch, filterMode, workingActiveRepos ] );

	let filterModeDisplay: ReactNode;
	if ( filterMode === 'Default' ) {
		filterModeDisplay = <DefaultRepoFilter />;
	} else {
		filterModeDisplay = (
			<ManualRepoFilter
				activeRepos={ workingActiveRepos }
				setActiveRepos={ setWorkingActiveRepos }
			/>
		);
	}

	const filterModeOptions: FilterMode[] = [ 'Default', 'Manual' ];
	const handleSwitchModeClick = useCallback( ( newFilterMode: string ) => {
		setFilterMode( newFilterMode as FilterMode );
	}, [] );

	const popoverBodyClasses = [ styles.repoPopoverBody ];
	if ( filterMode === 'Manual' ) {
		popoverBodyClasses.push( styles.repoPopoverManualModeBody );
	}

	const currentFilterDescriptionId = 'current-repo-filter';
	const currentFilterDescription =
		savedActiveRepos.length > 0
			? 'Manual custom repository filter is active.'
			: 'Default repository filter is active.';

	return (
		<>
			<button
				className={ styles.dropdownButton }
				ref={ refs.setReference }
				{ ...getReferenceProps() }
				data-active={ savedActiveRepos.length > 0 }
				aria-label="Repository filter"
				aria-describedby={ currentFilterDescriptionId }
			>
				<FilterIcon aria-hidden={ true } className={ styles.inlineIcon } />
				<span>Repositories</span>
				<DownIcon aria-hidden={ true } className={ styles.inlineIcon } />
			</button>
			<span hidden id={ currentFilterDescriptionId }>
				{ currentFilterDescription }
			</span>
			{ isPopoverOpen && (
				<FloatingFocusManager context={ context } modal={ false }>
					<div
						className={ styles.repoPopover }
						ref={ refs.setFloating }
						style={ {
							position: strategy,
							top: y ?? 0,
							left: x ?? 0,
						} }
						{ ...getFloatingProps() }
						aria-label="Repository filter popover"
					>
						<div className={ styles.repoPopoverHeader }>
							<SegmentedControl
								options={ filterModeOptions }
								selectedOption={ filterMode }
								onSelect={ handleSwitchModeClick }
								controlId="repo-filter-mode"
								className={ styles.repoFilterModeControl }
								ariaLabel="Filter mode selector"
							/>
						</div>
						<div className={ popoverBodyClasses.join( ' ' ) }>{ filterModeDisplay }</div>
						<div className={ styles.repoPopoverFooter }>
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
					</div>
				</FloatingFocusManager>
			) }
		</>
	);
}

function usePopoverFloatingConfiguration(
	isPopoverOpen: boolean,
	onPopoverToggle: ( newIsPopoverOpenValue: boolean ) => void
) {
	const { x, y, refs, strategy, context } = useFloating( {
		placement: 'bottom-start',
		open: isPopoverOpen,
		onOpenChange: onPopoverToggle,
		middleware: [ shift() ],
		whileElementsMounted: autoUpdate,
	} );

	const click = useClick( context );
	const dismiss = useDismiss( context );
	const role = useRole( context );

	const { getReferenceProps, getFloatingProps } = useInteractions( [ click, dismiss, role ] );
	return { x, y, refs, strategy, context, getReferenceProps, getFloatingProps };
}
