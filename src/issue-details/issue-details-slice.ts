import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { startOver } from '../start-over/start-over-counter-slice';
import { updateStateFromHistory } from '../url-history/actions';
import { FeatureId, IssueDetails, IssueType } from './types';
import { ActionWithStaticData } from '../static-data/types';

const initialState: IssueDetails = {
	featureId: null,
	issueType: 'unset',
};

const validIssueTypes = new Set< IssueType >( [ 'unset', 'bug', 'featureRequest', 'urgent' ] );

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
	},
	extraReducers: ( builder ) => {
		builder
			.addCase( updateStateFromHistory, ( state, action ) => {
				const issueDetails = action.payload.issueDetails;
				if ( ! issueDetails || typeof issueDetails !== 'object' ) {
					return { ...initialState };
				}

				// Validate the payload from history, and fall back to the initial state if invalid.

				const issueType = validIssueTypes.has( issueDetails.issueType )
					? issueDetails.issueType
					: initialState.issueType;

				const actionWithStaticData = action as ActionWithStaticData;
				const { features } = actionWithStaticData.meta.reportingConfig;
				let featureId: FeatureId;
				if ( issueDetails.featureId === null || features[ issueDetails.featureId ] ) {
					featureId = issueDetails.featureId;
				} else {
					// This may seem silly because the initial state is currently null
					// but it future proofs in we change the initial state.
					featureId = initialState.featureId;
				}

				return { featureId, issueType };
			} )
			.addCase( startOver, () => {
				return {
					...initialState,
				};
			} );
	},
} );

export const issueDetailsReducer = issueDetailsSlice.reducer;
export const { setIssueType, setIssueFeatureId } = issueDetailsSlice.actions;

export function selectIssueDetails( state: RootState ): IssueDetails {
	return state.issueDetails;
}

export function selectIssueFeatureId( state: RootState ): FeatureId {
	return state.issueDetails.featureId;
}

export function selectIssueType( state: RootState ): IssueType {
	return state.issueDetails.issueType;
}
