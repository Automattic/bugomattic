import React, { FunctionComponent, SVGProps, createElement } from 'react';
import styles from '../duplicate-results.module.css';

interface Props {
	illustration: FunctionComponent< SVGProps< SVGSVGElement > >;
	header: string;
	message: string;
	ariaLive?: 'assertive' | 'polite';
	additionalScreenReaderText?: string;
}

export function PlaceholderMessage( {
	illustration,
	header,
	message,
	ariaLive,
	additionalScreenReaderText,
}: Props ) {
	return (
		<div className={ styles.placeholderWrapper } aria-live={ ariaLive }>
			{ createElement( illustration, {
				className: styles.placeholderIllustration,
				'aria-hidden': 'true',
			} ) }
			<h3 className={ styles.placeholderHeader }>{ header }</h3>
			<p className={ styles.placeholderText }>{ message }</p>
			{ additionalScreenReaderText && (
				<p className="screenReaderOnly">{ additionalScreenReaderText }</p>
			) }
		</div>
	);
}
