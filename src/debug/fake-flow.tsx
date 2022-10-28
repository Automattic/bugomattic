import React, { useCallback } from 'react';
import { selectActiveTasks, setNewTasks, SourcedTask } from '../active-tasks';
import { useAppDispatch, useAppSelector } from '../app';
import { IssueType, selectIssueDetails, setIssueFeature, setIssueType } from '../issue-details';
import { selectNormalizedReportingConfig, selectRelevantTasks } from '../reporting-config';
import { DebugView } from './debug-view';

export function FakeFlow() {
	const issueTypes: IssueType[] = [ 'unset', 'bug', 'featureRequest', 'showStopper' ];

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
			dispatch( setIssueFeature( featureId ) );
		},
		[ features, dispatch ]
	);

	const relevantTasks = useAppSelector( selectRelevantTasks );
	const activeTasks = useAppSelector( selectActiveTasks );

	const generateActiveTasks = useCallback( () => {
		dispatch( setNewTasks( relevantTasks ) );
	}, [ dispatch, setNewTasks, relevantTasks ] );

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
				<select value={ featureId || undefined } onChange={ handleFeatureIdChange }>
					{ allFeatureIds.map( ( featureId ) => (
						<option key={ featureId } value={ featureId }>
							{ featureId }
						</option>
					) ) }
				</select>
			</div>
			<div>
				<button onClick={ generateActiveTasks }>Generate Active Tasks</button>
			</div>
			<DebugView data={ relevantTasks } header="Relevant Tasks"></DebugView>
			<DebugView data={ activeTasks } header="Active Tasks (Manually Generated)"></DebugView>
			<TaskList tasks={ relevantTasks }></TaskList>
		</div>
	);
}

interface TaskListProps {
	tasks: SourcedTask[];
}

function TaskList( { tasks }: TaskListProps ) {
	const activeTasks = tasks.map( ( task ) => {
		return {
			...task,
			completed: false,
		};
	} );

	return (
		<DebugView header="Active Tasks (Component/Prop Generated)" data={ activeTasks }></DebugView>
	);
}
