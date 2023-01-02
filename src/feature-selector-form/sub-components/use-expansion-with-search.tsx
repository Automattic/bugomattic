import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../app';
import { selectReportingConfigSearchTerm } from '../../reporting-config';

export function useExpansionWithSearch() {
	const [ isExpanded, setIsExpanded ] = useState( false );
	const handleCollapseExpandToggle = useCallback(
		() => setIsExpanded( ! isExpanded ),
		[ isExpanded, setIsExpanded ]
	);

	// Recollapse if a search term changes
	const searchTerm = useAppSelector( selectReportingConfigSearchTerm );
	useEffect( () => setIsExpanded( false ), [ searchTerm ] );

	return {
		isExpanded,
		handleCollapseExpandToggle,
	};
}
