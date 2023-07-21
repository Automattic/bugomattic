import React, { ChangeEventHandler, FormEventHandler, ReactNode, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { FormErrorMessage, PrimaryButton, StepSubheader } from '../common/components';
import { selectIssueDetails, setIssueType } from '../issue-details/issue-details-slice';
import { IssueType } from '../issue-details/types';
import { ReactComponent as InfoIcon } from '../common/svgs/info.svg';
import { useMonitoring } from '../monitoring/monitoring-provider';
import { Tooltip } from 'react-tooltip';
import styles from './type-form.module.css';

interface Props {
	onContinue?: () => void;
}

export function TypeForm( { onContinue }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const { issueType } = useAppSelector( selectIssueDetails );

	const [ type, setType ] = useState< IssueType >( issueType );
	const [ typeVisited, setTypeVisited ] = useState( false );
	const [ submissionAttempted, setSubmissionAttempted ] = useState( false );

	const handleTypeChange: ChangeEventHandler< HTMLInputElement > = ( event ) => {
		const newType: IssueType = event.target.value as IssueType;
		setType( newType );
	};

	const handleTypeBlur = () => setTypeVisited( true );

	const typeIsInvalid = type === 'unset';

	const readyToContinue = ! typeIsInvalid;
	const showTypeError = ( submissionAttempted || typeVisited ) && typeIsInvalid;

	const handleSubmit: FormEventHandler< HTMLFormElement > = ( event ) => {
		event.preventDefault();
		setSubmissionAttempted( true );
		if ( readyToContinue ) {
			dispatch( setIssueType( type ) );

			monitoringClient.analytics.recordEvent( 'type_save', { issue_type: type } );

			if ( onContinue ) {
				onContinue();
			}
		}
	};

	const subheader = `Identify the type of issue you're reporting. The type you select will guide the reporting process.`;
	const urgentDescriptionId = 'urgent-description';
	const urgentIconId = 'urgent-icon';
	const urgentDescription =
		'For when you need to escalate something urgently to a product team. ' +
		'This should usually be reserved for widespread, critical issues such as outages or broken core workflows.';

	let typeErrorMessage: ReactNode = null;
	if ( showTypeError ) {
		typeErrorMessage = (
			<span className={ styles.formErrorWrapper }>
				<FormErrorMessage>You must pick an issue type</FormErrorMessage>
			</span>
		);
	}

	return (
		<form onSubmit={ handleSubmit } aria-label="Set issue type">
			<StepSubheader>{ subheader }</StepSubheader>
			<fieldset className={ styles.typeFieldset }>
				<legend className={ styles.typeLabel }>
					<span>Type</span>
					{ typeErrorMessage }
				</legend>

				<div className={ styles.radioWrapper }>
					<label className={ styles.radio }>
						<input
							type="radio"
							checked={ type === 'bug' }
							value="bug"
							name="type"
							onChange={ handleTypeChange }
							onBlur={ handleTypeBlur }
							aria-required={ true }
							aria-invalid={ showTypeError }
						/>
						Bug
					</label>
				</div>

				<div className={ styles.radioWrapper }>
					<label className={ styles.radio }>
						<input
							type="radio"
							checked={ type === 'feature-request' }
							value="feature-request"
							name="type"
							onChange={ handleTypeChange }
							onBlur={ handleTypeBlur }
							aria-required={ true }
							aria-invalid={ showTypeError }
						/>
						Feature Request
					</label>
				</div>

				<div className={ `${ styles.radioWrapper } ${ styles.radioWrapperWithIcon }` }>
					<label className={ styles.radio }>
						<input
							type="radio"
							checked={ type === 'urgent' }
							value="urgent"
							name="type"
							onChange={ handleTypeChange }
							onBlur={ handleTypeBlur }
							aria-required={ true }
							aria-invalid={ showTypeError }
							aria-describedby={ urgentDescriptionId }
						/>
						{ "It's Urgent!" }
					</label>
					<InfoIcon
						aria-hidden={ true }
						tabIndex={ -1 }
						className={ styles.infoIcon }
						id={ urgentIconId }
					/>
					<Tooltip
						anchorSelect={ `#${ urgentIconId }` }
						className={ styles.tooltip }
						content={ urgentDescription }
						place="right"
						events={ [ 'click', 'hover' ] }
					/>
					<span hidden={ true } id={ urgentDescriptionId }>
						{ urgentDescription }
					</span>
				</div>
			</fieldset>

			<div className={ styles.continueWrapper }>
				<PrimaryButton>Continue</PrimaryButton>
			</div>
		</form>
	);
}
