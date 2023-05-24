import { RefObject, createRef, useCallback, useRef, useState } from 'react';

type Orientation = 'vertical' | 'horizontal';

interface OptionsInfo {
	length: number;
	initiallyFocusedIndex: number;
}

export function useListboxFocusManager< OptionElementType extends HTMLElement = HTMLElement >(
	orientation: Orientation,
	{ length, initiallyFocusedIndex }: OptionsInfo
) {
	const [ focusedIndex, setFocusedIndex ] = useState( initiallyFocusedIndex );

	const refs = useRef< RefObject< OptionElementType >[] >( [] );
	for ( let i = 0; i < length; i++ ) {
		if ( ! refs.current[ i ] ) {
			refs.current[ i ] = createRef();
		}
	}

	// An "imperative" (i.e. focusing directly in an event callback) focus approach is more resilient
	// than using useEffect hooks for managing focus race conditions. Because we have some page-header
	// focusing logic in the app, we use that imperative approach here.
	const focusIndex = useCallback( ( index: number ) => {
		setFocusedIndex( index );
		refs.current[ index ].current?.focus();
	}, [] );

	const handleKeyDown = useCallback(
		( event: React.KeyboardEvent ) => {
			const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
			const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

			const lastAvailableOptionIndex = length - 1;

			const goToNext = () => {
				if ( focusedIndex < lastAvailableOptionIndex ) {
					focusIndex( focusedIndex + 1 );
				}
			};

			const goToPrevious = () => {
				if ( focusedIndex > 0 ) {
					focusIndex( focusedIndex - 1 );
				}
			};

			const goToFirst = () => {
				focusIndex( 0 );
			};

			const goToLast = () => {
				focusIndex( lastAvailableOptionIndex );
			};

			event.stopPropagation();
			switch ( event.key ) {
				case nextKey:
					event.preventDefault();
					goToNext();
					break;
				case previousKey:
					event.preventDefault();
					goToPrevious();
					break;
				case 'Home':
					event.preventDefault();
					goToFirst();
					break;
				case 'End':
					event.preventDefault();
					goToLast();
					break;
			}
		},
		[ focusIndex, focusedIndex, length, orientation ]
	);

	return {
		focusedIndex,
		refs,
		handleKeyDown,
	};
}
