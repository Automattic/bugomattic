import React, { RefObject, createRef, useRef, useState } from 'react';
import styles from './segmented-control.module.css';
import { useListboxKeyboardNavigation } from './use-listbox-keyboard-navigation';

interface OptionWithDisplayText {
	value: string;
	displayText: string;
}

interface Props {
	options: ( OptionWithDisplayText | string )[];
	selectedOption: string;
	onSelect: ( option: string ) => void;
	controlId: string;
	className?: string;
	ariaLabel?: string;
}

function optionIsString( option: string | OptionWithDisplayText ): option is string {
	return typeof option === 'string';
}

function getOptionValue( option: string | OptionWithDisplayText ) {
	return optionIsString( option ) ? option : option.value;
}

function getOptionDisplayText( option: string | OptionWithDisplayText ) {
	return optionIsString( option ) ? option : option.displayText;
}

export function SegmentedControl( {
	options,
	selectedOption,
	onSelect,
	controlId,
	className,
	ariaLabel,
}: Props ) {
	const selectedIndex = options.findIndex(
		( option ) => getOptionValue( option ) === selectedOption
	);
	const [ focusedIndex, setFocusedIndex ] = useState( selectedIndex );

	const optionsRefs = useRef< RefObject< HTMLButtonElement >[] >( [] );
	optionsRefs.current = options.map(
		( _, index ) => optionsRefs.current[ index ] ?? createRef< HTMLButtonElement >()
	);

	const focusIndex = ( index: number ) => {
		setFocusedIndex( index );
		optionsRefs.current[ index ].current?.focus();
	};

	const lastAvailableOptionIndex = options.length - 1;

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

	const handleKeyDown = useListboxKeyboardNavigation( 'horizontal', {
		goToNext,
		goToPrevious,
		goToFirst,
		goToLast,
	} );

	const createId = ( option: string | OptionWithDisplayText ) =>
		`${ controlId }-${ getOptionValue( option ) }`;

	const createClickHandler = ( option: string | OptionWithDisplayText ) => () => {
		const optionValue = getOptionValue( option );
		if ( optionValue !== selectedOption ) {
			onSelect( optionValue );
		}
	};

	const isSelected = ( option: string | OptionWithDisplayText ) => {
		const optionValue = getOptionValue( option );
		return optionValue === selectedOption;
	};

	const wrapperClasses = className ? `${ styles.wrapper } ${ className }` : styles.wrapper;

	return (
		// This extra wrapper helps with a weird paint glitch in Chromium browsers that can sometimes
		// leave a single pixel of whitespace within the control.
		<div className={ wrapperClasses }>
			<div
				aria-label={ ariaLabel }
				role="listbox"
				aria-orientation="horizontal"
				aria-activedescendant={ createId( selectedOption ) }
				onKeyDown={ handleKeyDown }
				className={ styles.control }
			>
				{ options.map( ( option, index ) => (
					<button
						id={ createId( option ) }
						ref={ optionsRefs.current[ index ] }
						key={ getOptionValue( option ) }
						onClick={ createClickHandler( option ) }
						aria-selected={ isSelected( option ) }
						tabIndex={ index === focusedIndex ? 0 : -1 }
						role="option"
						className={ styles.option }
					>
						{ getOptionDisplayText( option ) }
					</button>
				) ) }
			</div>
		</div>
	);
}
