import React, { ReactNode } from 'react';
import styles from '../reporting-flow-page.module.css';
import { TextButton } from '../../common/components';

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
		<section aria-labelledby={ headerId } className={ styles.stepContainer }>
			<div className={ styles.stepHeaderRow }>
				<h3 className={ styles.stepHeader } id={ headerId }>
					{ stepIconDisplay }
					<span className={ styles.stepHeaderTitle }>{ title }</span>
				</h3>
				{ showEditButton && (
					<TextButton onClick={ onEdit } aria-describedby={ headerId }>
						Edit
					</TextButton>
				) }
			</div>
			{ children && <div className={ styles.stepContent }>{ children }</div> }
		</section>
	);
}
