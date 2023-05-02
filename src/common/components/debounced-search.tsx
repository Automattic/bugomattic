import React, { useCallback, useMemo, useState } from 'react';
import styles from './debounced-search.module.css';
import debounce from 'lodash.debounce';
import { ReactComponent as SearchIcon } from '../svgs/search.svg';

interface Props {
	callback: ( searchTerm: string ) => void;
	debounceMs?: number;
	debounceCharacterMinimum?: number;
	placeholder?: string;
	className?: string;
	inputAriaControls?: string;
	inputAriaLabel?: string;
}

export function DebouncedSearch( {
	callback,
	debounceMs = 300,
	debounceCharacterMinimum = 0,
	placeholder = 'Search',
	className,
	inputAriaControls,
	inputAriaLabel,
}: Props ) {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ lastEmittedSearchTerm, setLastEmittedSearchTerm ] = useState( '' );

	const callCallback = useCallback(
		( searchTerm: string ) => {
			setLastEmittedSearchTerm( searchTerm );
			callback( searchTerm );
		},
		[ callback ]
	);

	const conditionallyCallCallback = useCallback(
		( searchTerm: string ) => {
			if ( searchTerm.length >= debounceCharacterMinimum && searchTerm !== lastEmittedSearchTerm ) {
				callCallback( searchTerm );
			}
		},
		[ callCallback, debounceCharacterMinimum, lastEmittedSearchTerm ]
	);

	const debouncedCallback = useMemo(
		() => debounce( conditionallyCallCallback, debounceMs ),
		[ conditionallyCallCallback, debounceMs ]
	);

	const searchImmediately = () => {
		debouncedCallback.cancel();
		const trimmedSearchTerm = searchTerm.trim();
		// See the comment below on trimming -- after hitting enter, the user would expect to
		// see the trimmed input in the actual input field.
		setSearchTerm( trimmedSearchTerm );
		callCallback( trimmedSearchTerm );
	};

	const handleEnter = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' ) {
			searchImmediately();
		}
	};

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newSearchTerm = event.target.value;
		setSearchTerm( newSearchTerm );
		debouncedCallback( newSearchTerm.trim() );
	};

	// We only ever call the callback with a trimmed search term.
	// However, trimming the actual value in the input on change, or even on debouncing
	// feels really weird and clunky to the user. So we only trim the actual value in the
	// input field on enter (or search button) and on blur.
	const handleBlur = () => {
		setSearchTerm( searchTerm.trim() );
	};

	const classNames = [ styles.search ];
	if ( className ) {
		classNames.push( className );
	}

	return (
		<div className={ styles.wrapper }>
			<input
				className={ classNames.join( ' ' ) }
				placeholder={ placeholder }
				type="text"
				value={ searchTerm }
				onChange={ handleChange }
				onKeyUp={ handleEnter }
				onBlur={ handleBlur }
				aria-label={ inputAriaLabel }
				aria-controls={ inputAriaControls }
			/>
			<button
				onClick={ searchImmediately }
				className={ styles.button }
				tabIndex={ -1 }
				aria-hidden={ true }
			>
				<SearchIcon aria-hidden={ true } className={ styles.searchIcon }></SearchIcon>
			</button>
		</div>
	);
}
