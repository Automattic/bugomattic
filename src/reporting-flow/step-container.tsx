import React, { ReactNode } from 'react';
import styles from './reporting-flow.module.css';

interface Props {
	onEdit: () => void;
	showEditButton: boolean;
	title: string;
	stepNumber: number;
	isComplete: boolean;
	children: ReactNode;
}

export function StepContainer( {
	onEdit,
	showEditButton,
	title,
	stepNumber,
	isComplete,
	children,
}: Props ) {
	const headerId = `step-header-${ stepNumber }`;

	let stepIconDisplay: ReactNode;
	if ( isComplete ) {
		stepIconDisplay = (
			<div className={ styles.checkmarkWrapper } aria-label="Completed step:">
				<span className={ styles.checkmark }>&#10003;</span>
			</div>
		);
	} else {
		stepIconDisplay = (
			<div className={ styles.stepNumberWrapper } aria-label={ `Step number ${ stepNumber }:` }>
				<span className={ styles.stepNumber }>{ stepNumber }</span>
			</div>
		);
	}

	return (
		<section aria-labelledby={ headerId } className={ styles.container }>
			<div className={ styles.headerRow }>
				<h2 className={ styles.header } id={ headerId }>
					{ stepIconDisplay }
					<span className={ styles.headerTitle }>{ title }</span>
				</h2>
				{ showEditButton && (
					<button className={ styles.editButton } onClick={ onEdit }>
						Edit
					</button>
				) }
			</div>
			{ children && <div className={ styles.content }>{ children }</div> }
		</section>
	);
}
