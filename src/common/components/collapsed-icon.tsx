import React from 'react';

interface props {
	className?: string;
}

export function CollapsedIcon( { className }: props ) {
	return (
		<span className={ className }>
			<>&#x2C3;</>
		</span>
	);
}
