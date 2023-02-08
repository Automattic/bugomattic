import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { NormalizedReportingConfig } from '../reporting-config/types';
import { updateStateFromHistory } from '../url-history/actions';
import { FeatureId, IssueDetails, IssueType } from './types';

const initialState: IssueDetails = {
	featureId: null,
	issueType: 'unset',
	issueTitle: '',
};

const validIssueTypes = new Set< IssueType >( [ 'unset', 'bug', 'featureRequest', 'urgent' ] );

export const issueDetailsSlice = createSlice( {
	name: 'issueDetails',
	initialState: initialState,
	reducers: {
		setIssueType( state, action: PayloadAction< IssueType > ) {
			const issueType = validIssueTypes.has( action.payload ) ? action.payload : state.issueType;
			return {
				...state,
				issueType: issueType,
			};
		},
		setIssueFeatureId( state, action: PayloadAction< FeatureId > ) {
			const actionWithReportingConfig = action as PayloadAction<
				FeatureId,
				string,
				NormalizedReportingConfig
			>;
			const { features } = actionWithReportingConfig.meta;

			let newFeatureId: FeatureId;
			if ( action.payload === null || features[ action.payload ] ) {
				newFeatureId = action.payload;
			} else {
				newFeatureId = state.featureId;
			}

			return {
				...state,
				featureId: newFeatureId,
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
			if ( ! issueDetails || typeof issueDetails !== 'object' ) {
				return { ...initialState };
			}

			// Validate the payload from history, and fall back to the initial state if invalid.

			const issueType = validIssueTypes.has( issueDetails.issueType )
				? issueDetails.issueType
				: initialState.issueType;

			const issueTitle = issueDetails.issueTitle ?? initialState.issueTitle;

			const actionWithReportingConfig = action as PayloadAction<
				FeatureId,
				string,
				NormalizedReportingConfig
			>;
			const { features } = actionWithReportingConfig.meta;
			let featureId: FeatureId;
			if ( issueDetails.featureId === null || features[ issueDetails.featureId ] ) {
				featureId = issueDetails.featureId;
			} else {
				// This may seem silly because the initial state is currently null
				// but it future proofs in we change the initial state.
				featureId = initialState.featureId;
			}

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
