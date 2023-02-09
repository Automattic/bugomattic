import React, {
	ChangeEventHandler,
	FormEventHandler,
	ReactNode,
	useCallback,
	useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { FormErrorMessage, LimitedTextField } from '../common/components';
import {
	selectIssueDetails,
	setIssueTitle,
	setIssueType,
} from '../issue-details/issue-details-slice';
import { IssueType } from '../issue-details/types';
import { ReactComponent as InfoIcon } from '../common/svgs/info.svg';
import { useMonitoring } from '../monitoring/monitoring-provider';
import styles from './type-title-form.module.css';

interface Props {
	onContinue?: () => void;
}

export function TypeTitleForm( { onContinue }: Props ) {
	const dispatch = useAppDispatch();
	const monitoringClient = useMonitoring();
	const { issueTitle, issueType } = useAppSelector( selectIssueDetails );

	const [ title, setTitle ] = useState( issueTitle );
	const [ type, setType ] = useState< IssueType >( issueType );
	const [ titleVisited, setTitleVisited ] = useState( false );
	const [ typeVisited, setTypeVisited ] = useState( false );
	const [ submissionAttempted, setSubmissionAttempted ] = useState( false );

	// Memoize because it's passed down as a prop
	const handleTitleChange: ChangeEventHandler< HTMLInputElement > = useCallback(
		( event ) => setTitle( event.target.value ),
		[]
	);

	const handleTypeChange: ChangeEventHandler< HTMLInputElement > = ( event ) => {
		const newType: IssueType = event.target.value as IssueType;
		setType( newType );
	};

	// Memoize because it's passed down as a prop
	const handleTitleBlur = useCallback( () => setTitleVisited( true ), [] );
	const handleTypeBlur = () => setTypeVisited( true );

	const titleCharacterLimit = 200;
	const titleIsInvalid = title.length > titleCharacterLimit;
	const typeIsInvalid = type === 'unset';

	const readyToContinue = ! typeIsInvalid && ! titleIsInvalid;
	const showTitleError = ( submissionAttempted || titleVisited ) && titleIsInvalid;
	const showTypeError = ( submissionAttempted || typeVisited ) && typeIsInvalid;

	const handleSubmit: FormEventHandler< HTMLFormElement > = ( event ) => {
		event.preventDefault();
		setSubmissionAttempted( true );
		if ( readyToContinue ) {
			dispatch( setIssueTitle( title ) );
			dispatch( setIssueType( type ) );

			monitoringClient.analytics.recordEvent( 'type_save', { issueType: type } );
			if ( title ) {
				monitoringClient.analytics.recordEvent( 'title_save' );
			}

			if ( onContinue ) {
				onContinue();
			}
		}
	};

	const urgentTooltipId = 'urgent-info-icon';
	const urgentDescription =
		'For when you need to escalate something urgently to a product team. ' +
		'This should usually be reserved for widespread, critical issues such as outages or broken core workflows.';

	let titleErrorMessage: ReactNode = null;
	if ( showTitleError ) {
		titleErrorMessage = (
			<span className={ styles.formErrorWrapper }>
				<FormErrorMessage>Title must be under the character limit</FormErrorMessage>
			</span>
		);
	}

	let typeErrorMessage: ReactNode = null;
	if ( showTypeError ) {
		typeErrorMessage = (
			<span className={ styles.formErrorWrapper }>
				<FormErrorMessage>You must pick an issue type</FormErrorMessage>
			</span>
		);
	}

	return (
		<form onSubmit={ handleSubmit } aria-label="Set issue title and type">
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
							checked={ type === 'featureRequest' }
							value="featureRequest"
							name="type"
							onChange={ handleTypeChange }
							onBlur={ handleTypeBlur }
							aria-required={ true }
							aria-invalid={ showTypeError }
						/>
						Feature Request
					</label>
				</div>

				<div className={ styles.radioWrapper }>
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
							aria-describedby={ urgentTooltipId }
						/>
						{ "It's Urgent!" }
						<InfoIcon
							aria-hidden={ true }
							className={ styles.infoIcon }
							title={ urgentDescription }
						/>
					</label>
					<span className="screenReaderOnly" id={ urgentTooltipId } role="tooltip">
						{ urgentDescription }
					</span>
				</div>
			</fieldset>

			<div className={ styles.titleWrapper }>
				<label>
					<span className={ styles.titleLabel }>
						<span>{ 'GitHub Issue Title (Optional)' }</span>
						{ titleErrorMessage }
					</span>
					<LimitedTextField
						onBlur={ handleTitleBlur }
						value={ title }
						onChange={ handleTitleChange }
						characterLimit={ titleCharacterLimit }
					/>
				</label>
			</div>

			<div className={ styles.continueWrapper }>
				<button className="primaryButton">Continue</button>
			</div>
		</form>
	);
}
