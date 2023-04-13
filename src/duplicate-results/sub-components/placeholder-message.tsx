import React, { FunctionComponent, SVGProps, createElement } from 'react';
import styles from '../duplicate-results.module.css';

interface Props {
	illustration: FunctionComponent< SVGProps< SVGSVGElement > >;
	header: string;
	message: string;
}

export function PlaceholderMessage( { illustration, header, message }: Props ) {
	return (
		<div className={ styles.placeholderWrapper }>
			{ createElement( illustration, { className: styles.placeholderIllustration } ) }
			<h3 className={ styles.placeholderHeader }>{ header }</h3>
			<p className={ styles.placeholderText }>{ message }</p>
		</div>
	);
}
