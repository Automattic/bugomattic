import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app';
import { addCompletedTask, removeCompletedTask, selectCompletedTasks } from '../completed-tasks';
import { IssueType, selectIssueDetails, setIssueFeature, setIssueType } from '../issue-details';
import { selectNormalizedReportingConfig, selectRelevantTaskIds } from '../reporting-config';

export function FakeFlow() {
	return (
		<div>
			<h2>Collect Issue Details:</h2>
			<FakeIssueForm />
			<h2>Tasks:</h2>
			<FakeTaskList />
		</div>
	);
}

function FakeIssueForm() {
	const issueTypes: IssueType[] = [ 'unset', 'bug', 'featureRequest', 'blocker' ];
	const noFeatureSelected = '(No feature selected)';

	const dispatch = useAppDispatch();
	const { issueType, featureId } = useAppSelector( selectIssueDetails );
	const { features } = useAppSelector( selectNormalizedReportingConfig );
	const allFeatureIds = Object.keys( features );

	const handleIssueTypeChange = useCallback(
		( event: React.ChangeEvent< HTMLSelectElement > ) => {
			const issueType = event.currentTarget.value;
			dispatch( setIssueType( issueType as IssueType ) );
		},
		[ issueType, dispatch ]
	);

	const handleFeatureIdChange = useCallback(
		( event: React.ChangeEvent< HTMLSelectElement > ) => {
			const featureId = event.currentTarget.value;
			if ( featureId === noFeatureSelected ) {
				dispatch( setIssueFeature( null ) );
			} else {
				dispatch( setIssueFeature( featureId ) );
			}
		},
		[ features, dispatch ]
	);

	return (
		<div>
			<div>
				<select value={ issueType } onChange={ handleIssueTypeChange }>
					{ issueTypes.map( ( issueType ) => (
						<option key={ issueType } value={ issueType }>
							{ issueType }
						</option>
					) ) }
				</select>
			</div>
			<div>
				<select value={ featureId || noFeatureSelected } onChange={ handleFeatureIdChange }>
					<option key={ noFeatureSelected } value={ noFeatureSelected }>
						{ noFeatureSelected }
					</option>
					{ allFeatureIds.map( ( featureId ) => (
						<option key={ featureId } value={ featureId }>
							{ featureId }
						</option>
					) ) }
				</select>
			</div>
		</div>
	);
}

function FakeTaskList() {
	const dispatch = useAppDispatch();
	const { tasks } = useAppSelector( selectNormalizedReportingConfig );
	const relevantTaskIds = useAppSelector( selectRelevantTaskIds );
	const completedTaskIds = useAppSelector( selectCompletedTasks );

	const handleCheckboxChange = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			const taskId = event.target.id;
			const wasChecked = event.target.checked;
			if ( wasChecked ) {
				dispatch( addCompletedTask( taskId ) );
			} else {
				dispatch( removeCompletedTask( taskId ) );
			}
		},
		[ dispatch ]
	);

	const createTaskDisplay = ( taskId: string ) => {
		const task = tasks[ taskId ];
		const isChecked = completedTaskIds.includes( taskId );
		const taskInstructions = task.instructions || '<No instructions for task>';
		let linkText = '';
		if ( task.link ) {
			switch ( task.link.type ) {
				case 'general':
					linkText = `General link to ${ task.link.href }`;
					break;
				case 'github':
					linkText = `GitHub link to ${ task.link.repository }`;
					break;
				case 'p2':
					linkText = `P2 link to ${ task.link.subdomain }`;
					break;
				case 'slack':
					linkText = `Slack link to #${ task.link.channel } channel`;
					break;
			}
		} else {
			linkText = '<No links for task>';
		}

		return (
			<label>
				<input
					type="checkbox"
					checked={ isChecked }
					onChange={ handleCheckboxChange }
					id={ taskId }
				/>
				{ taskInstructions } -- { linkText }
			</label>
		);
	};

	return (
		<div>
			{ relevantTaskIds.map( ( taskId ) => (
				<div key={ taskId }>{ createTaskDisplay( taskId ) }</div>
			) ) }
		</div>
	);
}
