import React, {
	ButtonHTMLAttributes,
	HTMLProps,
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
} from '@floating-ui/react';
import styles from './dropdown.module.css';

interface DropdownFloatingConfig {
	placement?: Placement;
}

export function useDropdown( { placement }: DropdownFloatingConfig ) {
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
	// TODO: set the right role, likely based on props.
	const role = useRole( context );

	const listElementsRef = useRef< Array< HTMLElement | null > >( [] );
	const listNavigation = useListNavigation( context, {
		listRef: listElementsRef,
		activeIndex: activeListIndex,
		onNavigate: setActiveListIndex,
	} );

	// Merge all the interactions into prop getters
	const interactions = useInteractions( [ click, dismiss, role, listNavigation ] );

	return useMemo( () => {
		return {
			isDropdownOpen,
			setIsDropdownOpen,
			listElementsRef,
			activeListIndex,
			setActiveListIndex,
			...floatingData,
			...interactions,
		};
	}, [
		isDropdownOpen,
		setIsDropdownOpen,
		listElementsRef,
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

	if ( ! isValidElement( children ) ) {
		throw new Error( '<DropdownTrigger /> must have a single, valid child element' );
	}

	return cloneElement(
		children,
		dropdownContext.getReferenceProps( {
			ref: dropdownContext.refs.setReference,
			...props,
			...children.props,
			'data-state': dropdownContext.isDropdownOpen ? 'open' : 'closed',
		} )
	);
}

export function DropdownContent( { children, style, ...props }: HTMLProps< HTMLDivElement > ) {
	const dropdownContext = useDropdownContext();

	const { x, y, strategy, context, getFloatingProps, refs, listElementsRef } = dropdownContext;

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
						<FloatingList elementsRef={ listElementsRef }>{ children }</FloatingList>
					</div>
				</FloatingFocusManager>
			) }
		</>
	);
}

export function DropdownItem( {
	children,
	onClick,
	className,
	...props
}: ButtonHTMLAttributes< HTMLButtonElement > ) {
	const { setIsDropdownOpen, activeListIndex } = useDropdownContext();
	const { ref, index } = useListItem();

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
			ref={ ref }
			onClick={ handleClick }
			tabIndex={ isActive ? 0 : -1 }
			className={ combinedClassName }
			{ ...props }
		>
			{ children }
		</button>
	);
}
