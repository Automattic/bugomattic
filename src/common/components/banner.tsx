import React, { HTMLAttributes, ReactElement, cloneElement } from 'react';
import styles from './banner.module.css';

interface Props extends HTMLAttributes< HTMLElement > {
	illustration: ReactElement< HTMLAttributes< SVGAElement > >;
	header: string;
	message?: string;
	actionButton: ReactElement;
}

export function Banner( {
	illustration,
	header,
	message,
	actionButton,
	className,
	...props
}: Props ) {
	const combinedClassName = [ styles.banner, className ].join( ' ' );
	const illustrationDisplay = cloneElement( illustration, {
		'aria-hidden': true,
		className: styles.illustration,
	} );
	return (
		<section className={ combinedClassName } { ...props }>
			<div className={ styles.textAndImageWrapper }>
				{ illustrationDisplay }
				<div>
					<h3 className={ styles.header }>{ header }</h3>
					{ message && <p className={ styles.message }>{ message }</p> }
				</div>
			</div>
			<div className={ styles.actionButtonWrapper }>{ actionButton }</div>
		</section>
	);
}
