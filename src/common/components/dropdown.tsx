import React, {
	ButtonHTMLAttributes,
	HTMLProps,
	KeyboardEventHandler,
	MouseEventHandler,
	ReactNode,
	cloneElement,
	createContext,
	isValidElement,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	useFloating,
	shift,
	autoUpdate,
	useClick,
	useDismiss,
	useRole,
	useInteractions,
	FloatingFocusManager,
	FloatingList,
	useListItem,
	useListNavigation,
	Placement,
	useTypeahead,
} from '@floating-ui/react';
import styles from './dropdown.module.css';

type DropdownRole = 'menu' | 'listbox';

interface DropdownFloatingConfig {
	placement?: Placement;
	role: DropdownRole;
}

export function useDropdown( { placement, role }: DropdownFloatingConfig ) {
	const [ isDropdownOpen, setIsDropdownOpen ] = useState( false );
	const [ activeListIndex, setActiveListIndex ] = useState< number | null >( null );

	const floatingData = useFloating( {
		placement: placement || 'bottom-start',
		open: isDropdownOpen,
		onOpenChange: setIsDropdownOpen,
		middleware: [ shift() ],
		whileElementsMounted: autoUpdate,
	} );

	const { context } = floatingData;
	const click = useClick( context );
	const dismiss = useDismiss( context );
	const interactionsRole = useRole( context, { role } );

	const listElementsRef = useRef< Array< HTMLElement | null > >( [] );
	const listNavigation = useListNavigation( context, {
		listRef: listElementsRef,
		activeIndex: activeListIndex,
		onNavigate: setActiveListIndex,
	} );

	const listLabelsRef = useRef< Array< string | null > >( [] );
	const typeahead = useTypeahead( context, {
		listRef: listLabelsRef,
		activeIndex: activeListIndex,
		onMatch: setActiveListIndex,
	} );

	// Merge all the interactions into prop getters
	const interactions = useInteractions( [
		click,
		dismiss,
		interactionsRole,
		listNavigation,
		typeahead,
	] );

	return useMemo( () => {
		return {
			isDropdownOpen,
			setIsDropdownOpen,
			role,
			listElementsRef,
			listLabelsRef,
			activeListIndex,
			setActiveListIndex,
			...floatingData,
			...interactions,
		};
	}, [
		isDropdownOpen,
		setIsDropdownOpen,
		role,
		listElementsRef,
		listLabelsRef,
		activeListIndex,
		setActiveListIndex,
		floatingData,
		interactions,
	] );
}

type DropdownContext = ReturnType< typeof useDropdown > | null;

const DropdownContext = createContext< DropdownContext >( null );

export const useDropdownContext = () => {
	const context = React.useContext( DropdownContext );
	if ( ! context ) {
		throw new Error(
			'Any Dropdown child components must be wrapped in a parent <Dropdown /> component'
		);
	}
	return context;
};

interface DropdownProps extends DropdownFloatingConfig {
	children: ReactNode;
}

export function Dropdown( { children, ...floatingConfig }: DropdownProps ) {
	const dropdownData = useDropdown( floatingConfig );

	return <DropdownContext.Provider value={ dropdownData }>{ children }</DropdownContext.Provider>;
}

export function DropdownTrigger( { children, ...props }: HTMLProps< HTMLElement > ) {
	const dropdownContext = useDropdownContext();
	const { refs, isDropdownOpen, setIsDropdownOpen, role } = dropdownContext;

	if ( ! isValidElement( children ) ) {
		throw new Error( '<DropdownTrigger /> must have a single, valid child element' );
	}

	let handleKeyDown: KeyboardEventHandler | undefined;
	if ( role === 'listbox' ) {
		handleKeyDown = ( event ) => {
			const isPrintableCharacter = event.key.length === 1 && event.key.match( /\S/ );

			if ( isPrintableCharacter ) {
				setIsDropdownOpen( true );
			}
		};
	}

	return cloneElement(
		children,
		dropdownContext.getReferenceProps( {
			ref: refs.setReference,
			onKeyDown: handleKeyDown,
			...props,
			...children.props,
			'data-state': isDropdownOpen ? 'open' : 'closed',
		} )
	);
}

export function DropdownContent( { children, style, ...props }: HTMLProps< HTMLDivElement > ) {
	const dropdownContext = useDropdownContext();

	const { x, y, strategy, context, getFloatingProps, refs, listElementsRef, listLabelsRef } =
		dropdownContext;

	return (
		<>
			{ dropdownContext.isDropdownOpen && (
				<FloatingFocusManager context={ context } modal={ false }>
					<div
						ref={ refs.setFloating }
						style={ {
							position: strategy,
							top: y ?? 0,
							left: x ?? 0,
							...style,
						} }
						{ ...getFloatingProps( props ) }
						className={ styles.wrapper }
					>
						<FloatingList elementsRef={ listElementsRef } labelsRef={ listLabelsRef }>
							{ children }
						</FloatingList>
					</div>
				</FloatingFocusManager>
			) }
		</>
	);
}

interface DropdownItemProps extends ButtonHTMLAttributes< HTMLButtonElement > {
	label: string;
}

export function DropdownItem( {
	children,
	label,
	onClick,
	className,
	...props
}: DropdownItemProps ) {
	const { setIsDropdownOpen, activeListIndex, getItemProps } = useDropdownContext();
	const { ref, index } = useListItem( { label } );

	const isActive = activeListIndex === index;

	const handleClick: MouseEventHandler< HTMLButtonElement > = ( event ) => {
		if ( onClick ) {
			onClick( event );
		}
		setIsDropdownOpen( false );
	};

	const combinedClassName = [ styles.item, className ].join( ' ' );

	return (
		<button
			{ ...getItemProps( {
				ref,
				onClick: handleClick,
				tabIndex: isActive ? 0 : -1,
				className: combinedClassName,
				...props,
			} ) }
		>
			{ children }
		</button>
	);
}
