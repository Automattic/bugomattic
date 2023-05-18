import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './buttons.module.css';

export const PrimaryButton = createButton( styles.primary );

export const ClearButton = createButton( styles.clear );

export const TextButton = createButton( styles.text );

export const OutlinePrimaryButton = createButton( styles.outlinePrimary );

export const OutlineNeutralButton = createButton( styles.outlineNeutral );

function createButton( buttonStyleClass: string ) {
	return forwardRef< HTMLButtonElement, ButtonHTMLAttributes< HTMLButtonElement > >(
		function Button( { className, children, ...props }, ref ) {
			const classes = [ styles.button, buttonStyleClass ];
			if ( className ) {
				classes.push( className );
			}

			return (
				<button className={ classes.join( ' ' ) } ref={ ref } { ...props }>
					{ children }
				</button>
			);
		}
	);
}
