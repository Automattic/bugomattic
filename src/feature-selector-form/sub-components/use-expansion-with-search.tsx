import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectStartOverCounter } from '../../start-over/start-over-counter-slice';
import { selectFeatureSearchTerm } from '../feature-selector-form-slice';

export function useExpansionWithSearch() {
	const [ isExpanded, setIsExpanded ] = useState( false );
	const handleCollapseExpandToggle = useCallback(
		() => setIsExpanded( ! isExpanded ),
		[ isExpanded, setIsExpanded ]
	);

	// Recollapse if a search term changes, or we start over
	const searchTerm = useAppSelector( selectFeatureSearchTerm );
	const startOverCounter = useAppSelector( selectStartOverCounter );
	useEffect( () => setIsExpanded( false ), [ searchTerm, startOverCounter ] );

	return {
		isExpanded,
		handleCollapseExpandToggle,
	};
}
