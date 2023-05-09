import React, { ReactElement, cloneElement } from 'react';
import styles from '../duplicate-results.module.css';

interface Props {
	illustration: ReactElement;
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
			{ cloneElement( illustration, {
				className: `${ styles.placeholderIllustration } ${ illustration.props.className }`,
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
