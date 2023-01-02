import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../app';
import { selectFeatureSearchTerm } from '../feature-selector-form-slice';

export function useExpansionWithSearch() {
	const [ isExpanded, setIsExpanded ] = useState( false );
	const handleCollapseExpandToggle = useCallback(
		() => setIsExpanded( ! isExpanded ),
		[ isExpanded, setIsExpanded ]
	);

	// Recollapse if a search term changes
	const searchTerm = useAppSelector( selectFeatureSearchTerm );
	useEffect( () => setIsExpanded( false ), [ searchTerm ] );

	return {
		isExpanded,
		handleCollapseExpandToggle,
	};
}
