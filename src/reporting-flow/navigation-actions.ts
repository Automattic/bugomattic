import { createAction } from '@reduxjs/toolkit';
import { CompleteFeatureSelectionStepPayload, CompleteTitleAndTypeStepPayload } from './types';

export const completeFeatureSelectionStep = createAction< CompleteFeatureSelectionStepPayload >(
	'completeFeatureSelectionStep'
);

export const completeTitleAndTypeStep = createAction< CompleteTitleAndTypeStepPayload >(
	'completeTitleAndTypeStep'
);
