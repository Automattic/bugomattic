import React, {
	HTMLProps,
	ReactNode,
	cloneElement,
	createContext,
	forwardRef,
	isValidElement,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	useFloating,
	shift,
	autoUpdate,
	flip,
	useClick,
	useDismiss,
	useRole,
	useInteractions,
	useMergeRefs,
	FloatingFocusManager,
	FloatingList,
	useListItem,
	useListNavigation,
} from '@floating-ui/react';

export function useDropdown() {
	const [ isDropdownOpen, setIsDropdownOpen ] = useState( false );
	const [ activeListIndex, setActiveListIndex ] = useState< number | null >( null );

	const floatingData = useFloating( {
		placement: 'bottom-start',
		open: isDropdownOpen,
		onOpenChange: setIsDropdownOpen,
		middleware: [ shift(), flip() ],
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

interface DropdownProps {
	children: ReactNode;
}

export function Dropdown( { children }: DropdownProps ) {
	const dropdownData = useDropdown();

	return <DropdownContext.Provider value={ dropdownData }>{ children }</DropdownContext.Provider>;
}

interface DropdownTriggerProps {
	children: ReactNode;
}

export const DropdownTrigger = forwardRef<
	HTMLElement,
	HTMLProps< HTMLElement > & DropdownTriggerProps
>( function DropdownTrigger( { children, ...props }, propRef ) {
	const dropdownContext = useDropdownContext();
	const mergedRef = useMergeRefs( [ propRef, dropdownContext.refs.setReference ] );

	if ( ! isValidElement( children ) ) {
		throw new Error( '<DropdownTrigger /> must have a single, valid child element' );
	}

	return cloneElement(
		children,
		dropdownContext.getReferenceProps( {
			ref: mergedRef,
			...props,
			...children.props,
			'data-state': dropdownContext.isDropdownOpen ? 'open' : 'closed',
		} )
	);
} );

export const DropdownContent = forwardRef< HTMLDivElement, HTMLProps< HTMLDivElement > >(
	function DropdownContent( { children, style, ...props }, propRef ) {
		const dropdownContext = useDropdownContext();

		const { x, y, strategy, context, getFloatingProps, refs, listElementsRef } = dropdownContext;

		const mergedRef = useMergeRefs( [ propRef, refs.setFloating ] );

		return (
			<>
				{ dropdownContext.isDropdownOpen && (
					<FloatingFocusManager context={ context } modal={ false }>
						<div
							ref={ mergedRef }
							style={ {
								position: strategy,
								top: y ?? 0,
								left: x ?? 0,
								...style,
							} }
							{ ...getFloatingProps( props ) }
						>
							<FloatingList elementsRef={ listElementsRef }>{ children }</FloatingList>
						</div>
					</FloatingFocusManager>
				) }
			</>
		);
	}
);

export const DropdownItem = forwardRef< HTMLElement, HTMLProps< HTMLElement > >(
	function DropdownItem( { children, ...props }, propRef ) {
		const { setIsDropdownOpen, activeListIndex } = useDropdownContext();
		const { ref, index } = useListItem();

		const mergedRef = useMergeRefs( [ ref, propRef ] );
		const isActive = activeListIndex === index;

		if ( ! isValidElement( children ) ) {
			throw new Error( '<DropdownItem /> must have a single, valid child element' );
		}

		return cloneElement( children, {
			ref: mergedRef,
			onClick: () => {
				children.props.onClick?.();
				setIsDropdownOpen( false );
			},
			tabIndex: isActive ? 0 : -1,
			...props,
			...children.props,
		} );
	}
);
