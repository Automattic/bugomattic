import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
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
	reducers: {
		setIssueType( state, action: PayloadAction< IssueType > ) {
			return {
				...state,
				issueType: action.payload,
			};
		},
		setIssueFeatureId( state, action: PayloadAction< FeatureId > ) {
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
	extraReducers: ( builder ) => {
		builder.addCase( updateStateFromHistory, ( state, action ) => {
			const issueDetails = action.payload.issueDetails;
			if ( ! issueDetails ) {
				return { ...initialState };
			}

			// Validate the payload from history, and fall back to the initial state if invalid.
			const validIssueTypes = new Set< IssueType >( [
				'unset',
				'bug',
				'featureRequest',
				'urgent',
			] );
			const issueType = validIssueTypes.has( issueDetails.issueType )
				? issueDetails.issueType
				: initialState.issueType;
			const issueTitle = issueDetails.issueTitle ?? initialState.issueTitle;
			const featureId = issueDetails.featureId || initialState.featureId;

			return { featureId, issueType, issueTitle };
		} );
	},
} );

export const issueDetailsReducer = issueDetailsSlice.reducer;
export const { setIssueType, setIssueFeatureId, setIssueTitle } = issueDetailsSlice.actions;

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
