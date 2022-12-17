import React, {
	ChangeEventHandler,
	FormEventHandler,
	ReactNode,
	useCallback,
	useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '../app';
import { selectIssueDetails, setIssueTitle, setIssueType } from './issue-details-slice';
import { IssueType } from './types';
import styles from './title-type-form.module.css';
import { PrimaryButton } from '../common/components/primary-button';
import { LimitedTextField } from '../common';

export function TitleTypeForm() {
	const dispatch = useAppDispatch();
	const { issueTitle, issueType } = useAppSelector( selectIssueDetails );
	const [ title, setTitle ] = useState( issueTitle );
	const [ type, setType ] = useState< IssueType >( issueType );
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

	const titleCharacterLimit = 30;
	const titleIsInvalid = title.length > titleCharacterLimit;
	const typeIsInvalid = type === 'unset';

	const readyToContinue = ! typeIsInvalid && ! titleIsInvalid;
	const showTitleError = submissionAttempted && titleIsInvalid;
	const showTypeError = submissionAttempted && typeIsInvalid;

	let titleErrorMessage: ReactNode = null;
	if ( showTitleError ) {
		titleErrorMessage = (
			<span aria-live="assertive" className={ styles.fieldErrorMessage }>
				Title must be under the character limit
			</span>
		);
	}

	let typeErrorMessage: ReactNode = null;
	if ( showTypeError ) {
		typeErrorMessage = (
			<span aria-live="assertive" className={ styles.fieldErrorMessage }>
				You must pick an issue type
			</span>
		);
	}

	const handleSubmit: FormEventHandler< HTMLFormElement > = ( event ) => {
		event.preventDefault();
		setSubmissionAttempted( true );
		if ( readyToContinue ) {
			dispatch( setIssueTitle( title ) );
			dispatch( setIssueType( type ) );
		}
	};

	return (
		<form onSubmit={ handleSubmit }>
			<div className={ styles.titleWrapper }>
				<label>
					<span className={ styles.titleLabel }>
						<span>{ 'Title (Optional)' }</span>
						{ titleErrorMessage }
					</span>
					<LimitedTextField value={ title } onChange={ handleTitleChange } characterLimit={ 30 } />
				</label>
			</div>

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
							checked={ type === 'blocker' }
							value="blocker"
							name="type"
							onChange={ handleTypeChange }
							aria-required={ true }
							aria-invalid={ showTypeError }
						/>
						Blocker
					</label>
				</div>
			</fieldset>
			<div className={ styles.continueWrapper }>
				<PrimaryButton looksDisabled={ ! readyToContinue }>Continue</PrimaryButton>
			</div>
		</form>
	);
}
