import { createAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

export const updateStateFromHistory =
	createAction< Partial< RootState > >( 'updateStateFromHistory' );

export const updateHistoryWithState = createAction< void >( 'updateHistoryFromState' );
