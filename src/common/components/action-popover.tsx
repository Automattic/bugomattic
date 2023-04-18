import React, { HTMLProps, ReactNode, forwardRef, useCallback, useMemo, useState } from 'react';

import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useClick,
	useDismiss,
	useRole,
	useInteractions,
	FloatingFocusManager,
	useMergeRefs,
	Placement,
	Middleware,
} from '@floating-ui/react';
import styles from './action-popover.module.css';

export function X() {
	const [ isOpen, setIsOpen ] = useState( false );

	const { x, y, strategy, refs, context } = useFloating( {
		open: isOpen,
		onOpenChange: setIsOpen,
		middleware: [ offset( 10 ), flip(), shift() ],
		whileElementsMounted: autoUpdate,
	} );

	const click = useClick( context );
	const dismiss = useDismiss( context );
	const role = useRole( context );

	// Merge all the interactions into prop getters
	const { getReferenceProps, getFloatingProps } = useInteractions( [ click, dismiss, role ] );

	return (
		<>
			<button ref={ refs.setReference } { ...getReferenceProps() }>
				Reference element
			</button>
			{ isOpen && (
				<FloatingFocusManager context={ context } modal={ true }>
					<div
						ref={ refs.setFloating }
						style={ {
							position: strategy,
							top: y ?? 0,
							left: x ?? 0,
							width: 'max-content',
							zIndex: 1,
						} }
						{ ...getFloatingProps() }
					>
						Popover element
					</div>
				</FloatingFocusManager>
			) }
		</>
	);
}

interface ActionPopoverOptions {
	floatingUiPlacement?: Placement;
	floatingUiMiddleware?: Array< Middleware >;
}

export function useActionPopover( options: ActionPopoverOptions = {} ) {
	const { floatingUiPlacement, floatingUiMiddleware } = options;
	const [ isOpen, setIsOpen ] = useState( false );

	const middleWare = useMemo( () => {
		return [ ...( floatingUiMiddleware ?? [] ), shift() ];
	}, [ floatingUiMiddleware ] );

	const data = useFloating( {
		placement: floatingUiPlacement ?? 'bottom',
		open: isOpen,
		onOpenChange: setIsOpen,
		middleware: middleWare,
		whileElementsMounted: autoUpdate, // TODO: Do we even need this?
	} );

	const click = useClick( data.context );
	const dismiss = useDismiss( data.context );
	const role = useRole( data.context );

	const interactions = useInteractions( [ click, dismiss, role ] );

	return useMemo(
		() => ( {
			isOpen,
			setIsOpen,
			...data,
			...interactions,
		} ),
		[ isOpen, setIsOpen, data, interactions ]
	);
}

type ActionPopoverContext = ReturnType< typeof useActionPopover > | null;

const ActionPopoverContext = React.createContext< ActionPopoverContext >( null );

export const useActionPopoverContext = () => {
	const context = React.useContext( ActionPopoverContext );

	if ( ! context ) {
		throw new Error( 'Action Popover components must be wrapped in <ActionPopover />' );
	}

	return context;
};

interface ActionPopoverProps extends ActionPopoverOptions {
	children: ReactNode;
}

export function ActionPopover( {
	children,
	floatingUiPlacement,
	floatingUiMiddleware,
}: ActionPopoverProps ) {
	const actionPopoverContext = useActionPopover( { floatingUiPlacement, floatingUiMiddleware } );

	return (
		<ActionPopoverContext.Provider value={ actionPopoverContext }>
			{ children }
		</ActionPopoverContext.Provider>
	);
}

export const ActionPopoverTrigger = forwardRef< HTMLButtonElement, HTMLProps< HTMLButtonElement > >(
	function ActionPopoverTrigger( { children, ...props }, propRef ) {
		const actionPopoverContext = useActionPopoverContext();

		const ref = useMergeRefs( [ actionPopoverContext.refs.setReference, propRef ] );

		return (
			<button
				ref={ ref }
				type="button"
				data-state={ actionPopoverContext.isOpen ? 'open' : 'closed' }
				{ ...actionPopoverContext.getReferenceProps( props ) }
			>
				{ children }
			</button>
		);
	}
);

interface ActionPopoverContentProps {
	actionLabel: string;
	onAction: () => void;
}

export const ActionPopoverContent = forwardRef<
	HTMLDivElement,
	HTMLProps< HTMLDivElement > & ActionPopoverContentProps
>( function ActionPopoverContent( { children, actionLabel, onAction, ...props }, propRef ) {
	const actionPopoverContext = useActionPopoverContext();

	const ref = useMergeRefs( [ actionPopoverContext.refs.setFloating, propRef ] );

	const handleActionClick = useCallback( () => {
		onAction();
		actionPopoverContext.setIsOpen( false );
	}, [ onAction, actionPopoverContext ] );

	const handleCancelClick = useCallback( () => {
		actionPopoverContext.setIsOpen( false );
	}, [ actionPopoverContext ] );

	return (
		<>
			{ actionPopoverContext.isOpen && (
				<FloatingFocusManager context={ actionPopoverContext.context } modal={ true }>
					<div
						ref={ ref }
						className={ styles.contentWrapper }
						style={ {
							position: actionPopoverContext.strategy,
							top: actionPopoverContext.y ?? 0,
							left: actionPopoverContext.x ?? 0,
						} }
						{ ...actionPopoverContext.getFloatingProps( props ) }
					>
						<div>{ children }</div>
						<div>
							<button type="button" onClick={ handleCancelClick }>
								Cancel
							</button>
							<button type="button" onClick={ handleActionClick }>
								{ actionLabel }
							</button>
						</div>
					</div>
				</FloatingFocusManager>
			) }
		</>
	);
} );
