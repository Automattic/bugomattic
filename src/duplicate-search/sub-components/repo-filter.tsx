import React, { useState } from 'react';
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

export function RepoFilter() {
	const dispatch = useAppDispatch();

	const availableRepos = useAppSelector( selectAvailableRepoFilters );
	const savedActiveRepos = useAppSelector( selectActiveRepoFilters );

	const [ workingActiveRepos, setWorkingActiveRepos ] = useState( savedActiveRepos );
	const [ isDefaultFilterActive, setIsDefaultFilterActive ] = useState(
		savedActiveRepos.length === 0
	);

	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	const handlePopoverToggle = ( newIsPopoverOpenValue: boolean ) => {
		if ( newIsPopoverOpenValue ) {
			setWorkingActiveRepos( savedActiveRepos );
			setIsDefaultFilterActive( savedActiveRepos.length === 0 );
		}
		setIsPopoverOpen( newIsPopoverOpenValue );
	};

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

	const handleCancelClick = () => {
		setIsPopoverOpen( false );
	};

	const handleFilterClick = () => {
		const newRepoFilters = isDefaultFilterActive ? [] : workingActiveRepos;
		dispatch( setSearchParam( setActiveRepoFilters( newRepoFilters ) ) );
		setIsPopoverOpen( false );
	};

	const handleSwitchViewClick = () => {
		setIsDefaultFilterActive( ! isDefaultFilterActive );
	};

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
							<button type="button" onClick={ handleSwitchViewClick }>
								Switch
							</button>
							{ isDefaultFilterActive ? (
								<DefaultFilterView />
							) : (
								<RepoChecklist
									availableRepos={ availableRepos }
									activeRepos={ workingActiveRepos }
									setActiveRepos={ setWorkingActiveRepos }
								/>
							) }
						</div>
						<div>
							{ ' ' }
							<button type="button" onClick={ handleCancelClick }>
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

function DefaultFilterView() {
	return <p>Default filters</p>;
}
