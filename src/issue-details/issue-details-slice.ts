import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import {
	completeFeatureSelectionStep,
	completeTitleAndTypeStep,
} from '../reporting-flow/navigation-actions';
import { updateStateFromHistory } from '../url-history/actions';
import { FeatureId, IssueDetails, IssueType } from './types';

const initialState: IssueDetails = {
	featureId: null,
	issueType: 'unset',
	issueTitle: '',
};

export const issueDetailsSlice = createSlice( {
	name: 'issueDetails',
	initialState: initialState,
	reducers: {},
	extraReducers: ( builder ) => {
		builder
			.addCase( completeFeatureSelectionStep, ( state, action ) => {
				return {
					...state,
					featureId: action.payload.featureId,
				};
			} )
			.addCase( completeTitleAndTypeStep, ( state, action ) => {
				return {
					...state,
					issueTitle: action.payload.title,
					issueType: action.payload.type,
				};
			} )
			.addCase( updateStateFromHistory, ( _state, action ) => {
				return { ...action.payload.issueDetails };
			} );
	},
} );

export const issueDetailsReducer = issueDetailsSlice.reducer;

export function selectIssueDetails( state: RootState ): IssueDetails {
	return state.issueDetails;
}

export function selectIssueFeatureId( state: RootState ): FeatureId {
	return state.issueDetails.featureId;
}

export function selectIssueTitle( state: RootState ): string {
	return state.issueDetails.issueTitle;
}

export function selectIssueType( state: RootState ): IssueType {
	return state.issueDetails.issueType;
}
