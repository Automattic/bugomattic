import React, { useCallback, useState } from 'react';
import styles from './debounced-search.module.css';
import debounce from 'lodash.debounce';
import { ReactComponent as SearchIcon } from '../svgs/search.svg';

interface Props {
	callback: ( searchTerm: string ) => void;
	debounceMs?: number;
	placeholder?: string;
	className?: string;
}

export function DebouncedSearch( {
	callback,
	debounceMs = 300,
	placeholder = 'Search',
	className,
}: Props ) {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const debouncedCallback = useCallback( debounce( callback, debounceMs ), [ callback, debounce ] );

	const handleBlur = () => debouncedCallback.flush();
	const handleEnter = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' ) {
			debouncedCallback.flush();
		}
	};

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newSearchTerm = event.target.value;
		setSearchTerm( newSearchTerm );
		debouncedCallback( newSearchTerm );
	};

	const finalClassNames = [ styles.search ];
	if ( className ) {
		finalClassNames.push( className );
	}
	return (
		<div className={ styles.wrapper }>
			<input
				className={ finalClassNames.join( ' ' ) }
				placeholder={ placeholder }
				type="text"
				value={ searchTerm }
				onChange={ handleChange }
				onBlur={ handleBlur }
				onKeyUp={ handleEnter }
			/>
			<SearchIcon className={ styles.icon }></SearchIcon>
		</div>
	);
}
