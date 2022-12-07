import React from 'react';

interface props {
	className?: string;
}

export function ExpandedIcon( { className }: props ) {
	return (
		<span className={ className }>
			<>&#x2C5;</>
		</span>
	);
}
