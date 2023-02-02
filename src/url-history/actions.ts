import { createAction } from '@reduxjs/toolkit';
import { UrlTrackedState } from './types';

export const updateStateFromHistory = createAction< UrlTrackedState >( 'updateStateFromHistory' );
