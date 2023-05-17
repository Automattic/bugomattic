import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './buttons.module.css';

export const PrimaryButton = createButton( styles.primary );

export const ClearButton = createButton( styles.clear );

export const TextButton = createButton( styles.text );

export const OutlinePrimaryButton = createButton( styles.outlinePrimary );

export const OutlineNeutralButton = createButton( styles.outlineNeutral );

function createButton( buttonStlyeClass: string ) {
	return forwardRef< HTMLButtonElement, ButtonHTMLAttributes< HTMLButtonElement > >(
		function Button( { className, children, ...props }, ref ) {
			return (
				<button
					className={ `${ styles.button } ${ buttonStlyeClass } ${ className }` }
					ref={ ref }
					{ ...props }
				>
					{ children }
				</button>
			);
		}
	);
}
