import { useCallback, useMemo } from 'react';

type KeyHandler = () => void;

interface KeyHandlers {
	goToNext: KeyHandler;
	goToPrevious: KeyHandler;
	goToFirst: KeyHandler;
	goToLast: KeyHandler;
}

type Orientation = 'vertical' | 'horizontal';

export function useListboxKeyboardNavigation( orientation: Orientation, handlers: KeyHandlers ) {
	const nextKey = useMemo(
		() => ( orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight' ),
		[ orientation ]
	);
	const previousKey = useMemo(
		() => ( orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft' ),
		[ orientation ]
	);

	return useCallback(
		( event: React.KeyboardEvent ) => {
			event.stopPropagation();
			switch ( event.key ) {
				case nextKey:
					event.preventDefault();
					handlers.goToNext();
					break;
				case previousKey:
					event.preventDefault();
					handlers.goToPrevious();
					break;
				case 'Home':
					event.preventDefault();
					handlers.goToFirst();
					break;
				case 'End':
					event.preventDefault();
					handlers.goToLast();
					break;
			}
		},
		[ handlers, nextKey, previousKey ]
	);
}
