import React, {
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
	useTypeahead,
} from '@floating-ui/react';
import styles from './dropdown.module.css';

/**
 * This is a re-usable, composable children API for creating components that have some kind of dropdown functionality.
 * The main two usecases for this kind of API are:
 * 1. A dropdown menu -- like selecting menu items from a list.
 * 2. A custom select -- for creating a select-only combo box that launches a popover listbox.
 *
 * The API looks like so...
 * <Drowpdown role='menu'>
 * 		<DropdownTrigger>
 *   		{Your trigger element}
 * 		</DropdownTrigger>
 * 		<DropdownContent>
 *  		<DropdownItem typeaheadLabel="Item 1" role='menuitem'>Item 1</DropdownItem>
 * 			<DropdownItem typeaheadLabel="Item 2" role='menuitem'>Item 2</DropdownItem>
 * 			{... and so on}
 * 		</DropdownContent>
 * </Dropdown>
 *
 * You must provide which role the dropdown should have. This is either 'menu' or 'listbox' (the case of a select-only combobox).
 *
 * TODO: I would love to find a way to implement the typing behavior from this WAI ARIA example:
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
 * But... I'm having a really hard time getting it to play nicely with the FloatingUI API.
 * Add a KeyDown handler right on the trigger was messing with some of the auto-focus.
 * Also, because this follows a composable children pattern, we don't know all the labels upfront to pass to useTypeahead.
 */

type DropdownRole = 'menu' | 'listbox';

interface DropdownFloatingConfig {
	placement?: Placement;
	role: DropdownRole;
}

/**
 * This is the main shared hook that sets up all the Floating UI behavior.
 */
function useDropdown( { placement, role }: DropdownFloatingConfig ) {
	const [ isDropdownOpen, setIsDropdownOpen ] = useState( false );
	const [ activeItemIndex, setActiveItemIndex ] = useState< number | null >( null );

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
	// This intelligently takes the provided role and applies the right role and aria attributes.
	const interactionsRole = useRole( context, { role } );

	// List navigation is used for keyboard navigation of the list items.
	// The empty ref array may seem weird, but those refs are updated dynamically later as the popover opens.
	const listElementsRef = useRef< Array< HTMLElement | null > >( [] );
	const listNavigation = useListNavigation( context, {
		listRef: listElementsRef,
		activeIndex: activeItemIndex,
		onNavigate: setActiveItemIndex,
	} );

	// Typeahead lets you type while the popover is open to switch between items.
	// Same note on the empty ref array as above -- it is updated dynamically later.
	const listLabelsRef = useRef< Array< string | null > >( [] );
	const typeahead = useTypeahead( context, {
		listRef: listLabelsRef,
		activeIndex: activeItemIndex,
		onMatch: isDropdownOpen ? setActiveItemIndex : undefined,
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
			activeListIndex: activeItemIndex,
			setActiveListIndex: setActiveItemIndex,
			...floatingData,
			...interactions,
		};
	}, [
		isDropdownOpen,
		setIsDropdownOpen,
		role,
		listElementsRef,
		listLabelsRef,
		activeItemIndex,
		setActiveItemIndex,
		floatingData,
		interactions,
	] );
}

// We're using the React Context API to effectively surface all the FloatingUI data to child components.

type DropdownContext = ReturnType< typeof useDropdown > | null;

const DropdownContext = createContext< DropdownContext >( null );

const useDropdownContext = () => {
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

/**
 * This is the main wrapper component. You must provide the a role for the dropdown,.
 */
export function Dropdown( { children, ...floatingConfig }: DropdownProps ) {
	const dropdownData = useDropdown( floatingConfig );

	return <DropdownContext.Provider value={ dropdownData }>{ children }</DropdownContext.Provider>;
}

/**
 * The component for the trigger element. For now, we will allow any kind of element for flexibility.
 * In most cases, it should be a button, or maybe a link.
 */
export function DropdownTrigger( { children, ...props }: HTMLProps< HTMLElement > ) {
	const { refs, isDropdownOpen, getReferenceProps } = useDropdownContext();

	if ( ! isValidElement( children ) ) {
		throw new Error( '<DropdownTrigger /> must have a single, valid child element' );
	}

	return cloneElement(
		children,
		// In FloatingUI terms, the "reference" is the trigger element for the floating piece.
		getReferenceProps( {
			ref: refs.setReference,
			tabIndex: 0,
			...props,
			...children.props,
			'data-state': isDropdownOpen ? 'open' : 'closed',
		} )
	);
}

export function DropdownContent( { children, style, ...props }: HTMLProps< HTMLDivElement > ) {
	const {
		x,
		y,
		strategy,
		context,
		getFloatingProps,
		refs,
		listElementsRef,
		listLabelsRef,
		isDropdownOpen,
	} = useDropdownContext();

	return (
		<>
			{ isDropdownOpen && (
				<FloatingFocusManager context={ context } modal={ false }>
					<div
						// In FloatingUI terms, the "floating" element is the popover element.
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
						{ /* The FloatingList is a Context wrapper that surfaces list index information to child components */ }
						<FloatingList elementsRef={ listElementsRef } labelsRef={ listLabelsRef }>
							{ children }
						</FloatingList>
					</div>
				</FloatingFocusManager>
			) }
		</>
	);
}

interface DropdownItemProps extends HTMLProps< HTMLElement > {
	/**
	 * The label is what is used for matching items when typing.
	 */
	typeaheadLabel: string;
	/**
	 * The items can be rendered as buttons or links. Default is button.
	 */
	as?: 'button' | 'a';
}

export function DropdownItem( {
	children,
	typeaheadLabel,
	onClick,
	className,
	as: Component = 'button',
	...props
}: DropdownItemProps ) {
	const { setIsDropdownOpen, activeListIndex, getItemProps } = useDropdownContext();
	const { ref, index } = useListItem( { label: typeaheadLabel } );

	const isActive = activeListIndex === index;

	const handleClick: MouseEventHandler< HTMLButtonElement > = ( event ) => {
		if ( onClick ) {
			onClick( event );
		}
		setIsDropdownOpen( false );
	};

	const combinedClassName = [ styles.item, className ].join( ' ' );

	return (
		<Component
			{ ...getItemProps( {
				ref,
				onClick: handleClick,
				tabIndex: isActive ? 0 : -1,
				className: combinedClassName,
				...props,
			} ) }
		>
			{ children }
		</Component>
	);
}
