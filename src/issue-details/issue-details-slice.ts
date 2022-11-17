import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app';
import { FeatureId, IssueDetails, IssueType } from './types';

const initialState: IssueDetails = {
	featureId: null,
	issueType: 'unset',
	issueTitle: '',
};

export const issueDetailsSlice = createSlice( {
	name: 'issueDetails',
	initialState: initialState,
	reducers: {
		setIssueType( state, action: PayloadAction< IssueType > ) {
			return {
				...state,
				issueType: action.payload,
			};
		},
		setIssueFeature( state, action: PayloadAction< FeatureId > ) {
			return {
				...state,
				featureId: action.payload,
			};
		},
		setIssueTitle( state, action: PayloadAction< string > ) {
			return {
				...state,
				issueTitle: action.payload,
			};
		},
	},
} );

export const issueDetailsReducer = issueDetailsSlice.reducer;
export const { setIssueType, setIssueFeature, setIssueTitle } = issueDetailsSlice.actions;

export function selectIssueDetails( state: RootState ): IssueDetails {
	return state.issueDetails;
}
