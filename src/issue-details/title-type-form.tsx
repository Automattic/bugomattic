import React, { ChangeEventHandler, FormEventHandler, useState } from 'react';
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

	const handleTitleChange: ChangeEventHandler< HTMLInputElement > = ( event ) =>
		setTitle( event.target.value );

	const handleTypeChange: ChangeEventHandler< HTMLInputElement > = ( event ) => {
		const newType: IssueType = event.target.value as IssueType;
		setType( newType );
	};

	const readyToContinue = type !== 'unset';

	const handleSubmit: FormEventHandler< HTMLFormElement > = ( event ) => {
		event.preventDefault();
		if ( readyToContinue ) {
			dispatch( setIssueTitle( title ) );
			dispatch( setIssueType( type ) );
		}
	};

	return (
		<form onSubmit={ handleSubmit }>
			<div>
				<label>{ 'Title (Optional)' }</label>
				<LimitedTextField value={ title } onChange={ handleTitleChange } characterLimit={ 30 } />
			</div>

			<fieldset className={ styles.typeFieldset }>
				<legend className={ styles.radioLegend }>Type</legend>
				<div className={ styles.radioWrapper }>
					<label className={ styles.radio }>
						<input
							type="radio"
							checked={ type === 'bug' }
							value="bug"
							name="type"
							onChange={ handleTypeChange }
							required={ true }
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
							required={ true }
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
							required={ true }
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
