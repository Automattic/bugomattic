import React, { useMemo, useState } from 'react';
import styles from './debounced-search.module.css';
import debounce from 'lodash.debounce';
import { ReactComponent as SearchIcon } from '../svgs/search.svg';

interface Props {
	callback: ( searchTerm: string ) => void;
	debounceMs?: number;
	placeholder?: string;
	className?: string;
	inputAriaControls?: string;
	inputAriaLabel?: string;
}

export function DebouncedSearch( {
	callback,
	debounceMs = 300,
	placeholder = 'Search',
	className,
	inputAriaControls,
	inputAriaLabel,
}: Props ) {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const debouncedCallback = useMemo(
		() => debounce( callback, debounceMs ),
		[ callback, debounceMs ]
	);

	const flushDebounce = () => debouncedCallback.flush();

	const handleEnter = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' ) {
			flushDebounce();
		}
	};

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newSearchTerm = event.target.value;
		setSearchTerm( newSearchTerm );
		debouncedCallback( newSearchTerm );
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
				onBlur={ flushDebounce }
				onChange={ handleChange }
				onKeyUp={ handleEnter }
				aria-label={ inputAriaLabel }
				aria-controls={ inputAriaControls }
			/>
			<button
				onClick={ flushDebounce }
				className={ styles.button }
				tabIndex={ -1 }
				aria-hidden={ true }
			>
				<SearchIcon aria-hidden={ true }></SearchIcon>
			</button>
		</div>
	);
}
