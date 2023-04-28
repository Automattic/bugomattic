import React, { HTMLAttributes } from 'react';
import styles from './banner.module.css';

export function Banner( { children, className, ...props }: HTMLAttributes< HTMLElement > ) {
	const combinedClassName = [ styles.banner, className ].join( ' ' );
	return (
		<section className={ combinedClassName } { ...props }>
			{ children }
		</section>
	);
}
