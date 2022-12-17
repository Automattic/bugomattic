import React, { ChangeEventHandler, FormEventHandler, ReactNode, useRef, useState } from 'react';
import styles from './limited-text-field.module.css';

interface Props {
	value: string;
	onChange: ChangeEventHandler< HTMLInputElement >;
	characterLimit: number;
}

export function LimitedTextField( { value, onChange, characterLimit }: Props ) {
	const [ isFocused, setIsFocused ] = useState( false );
	const handleFocus = () => setIsFocused( true );
	const handleBlur = () => setIsFocused( false );

	const charactersRemaining = characterLimit - value.length;
	const isOverLimit = charactersRemaining < 0;

	const inputClassName = isOverLimit ? styles.invalidInput : '';

	const maxMessage = <>Maximum { characterLimit } characters</>;
	// Having a blank space by default renders the line in the DOM and prevents layout jumping.
	let limitMessage: ReactNode = <>&nbsp;</>;
	if ( isOverLimit ) {
		limitMessage = (
			<>
				{ maxMessage } &#40;
				<span className={ styles.limitWarning }>{ Math.abs( charactersRemaining ) } over</span>&#41;
			</>
		);
	} else if ( isFocused ) {
		if ( value === '' ) {
			limitMessage = maxMessage;
		} else {
			limitMessage = (
				<>
					{ maxMessage } &#40;{ charactersRemaining } remaining&#41;
				</>
			);
		}
	}

	return (
		<div>
			<input
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				type="text"
				value={ value }
				onChange={ onChange }
				className={ inputClassName }
			/>
			<p className={ styles.limitMessage }>{ limitMessage }</p>
		</div>
	);
}
