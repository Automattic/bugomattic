import React from 'react';
import styles from './segmented-control.module.css';
import { useListboxFocusManager } from './use-listbox-focus-manager';

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

	const { focusedIndex, refs, handleKeyDown } = useListboxFocusManager< HTMLButtonElement >(
		'horizontal',
		{
			length: options.length,
			initiallyFocusedIndex: selectedIndex,
		}
	);

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
						ref={ refs.current[ index ] }
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
