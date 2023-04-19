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
import { ManualRepoFilter } from './manual-repo-filter';
import { ReactComponent as DownIcon } from '../../common/svgs/chevron-down.svg';

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
			<ManualRepoFilter
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

	const popoverBodyClasses = [ styles.repoPopoverBody ];
	if ( filterMode === 'Manual' ) {
		popoverBodyClasses.push( styles.repoPopoverManualModeBody );
	}

	return (
		<>
			<button
				className={ styles.dropdownButton }
				ref={ refs.setReference }
				{ ...getReferenceProps() }
				data-active={ savedActiveRepos.length > 0 }
			>
				<span>Repositories</span>
				<DownIcon className={ styles.inlineIcon } />
			</button>
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
					>
						<div className={ styles.repoPopoverHeader }>
							<SegmentedControl
								options={ filterModeOptions }
								selectedOption={ filterMode }
								onSelect={ handleSwitchModeClick as ( option: string ) => void }
								controlId="repo-filter-mode"
								className={ styles.repoFilterModeControl }
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
