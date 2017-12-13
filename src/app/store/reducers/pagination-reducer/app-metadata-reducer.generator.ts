import { ActionReducerMap, combineReducers } from '@ngrx/store';
import { MetadataState } from '../../types/app-metadata.types';
import { appMetadataReducer } from '../app-metadata.reducer';
import { appMetadataRequestReducer } from '../app-metadata-request.reducer';

const appMetadataReducers: ActionReducerMap<MetadataState> = {
  values: appMetadataReducer,
  requests: appMetadataRequestReducer
};

export function appMetaDataReducer(state, action) {
  // https://github.com/ngrx/platform/issues/116#issuecomment-317297642
  return combineReducers<MetadataState>(appMetadataReducers)(state, action);
}
