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
import styles from '../issue-search-controls.module.css';
import { selectActiveRepoFilters, setActiveRepoFilters } from '../issue-search-slice';
import {
	ClearButton,
	OutlineNeutralButton,
	PrimaryButton,
	SegmentedControl,
} from '../../common/components';
import { DefaultRepoFilter } from './default-repo-filter';
import { ManualRepoFilter } from './manual-repo-filter';
import { ReactComponent as DownIcon } from '../../common/svgs/chevron-down.svg';
import { ReactComponent as FilterIcon } from '../../common/svgs/filter.svg';
import { ActiveRepos } from './types';
import { updateHistoryWithState } from '../../url-history/actions';
import { useMonitoring } from '../../monitoring/monitoring-provider';

type FilterMode = 'Default' | 'Manual';

export function RepoFilter() {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();

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

		dispatch( setActiveRepoFilters( newRepoFilters ) );
		dispatch( updateHistoryWithState() );

		monitoringClient.analytics.recordEvent( 'repo_filter_select', {
			repo_filter: newRepoFilters.join( ',' ),
		} );

		setIsPopoverOpen( false );
	}, [ dispatch, filterMode, monitoringClient.analytics, workingActiveRepos ] );

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

	const repoFiltersAreActive = savedActiveRepos.length > 0;
	const TriggerButtonComponent = repoFiltersAreActive ? PrimaryButton : OutlineNeutralButton;

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
			<TriggerButtonComponent
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
			</TriggerButtonComponent>
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
								<ClearButton onClick={ handleCancelClick }>Cancel</ClearButton>
								<PrimaryButton onClick={ handleFilterClick }>Filter</PrimaryButton>
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
