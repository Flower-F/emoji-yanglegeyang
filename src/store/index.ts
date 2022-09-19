import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import autoMergeLevel from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'

import { gameSlice } from './gameSlice'
import { imageSlice } from './imageSlice'
import { modalSlice } from './modalSlice'

const persistConfig = {
  key: 'global',
  storage,
  stateReconciler: autoMergeLevel,
}

const reducersNeedPersist = combineReducers({
  game: gameSlice.reducer,
})
const persistedReducer = persistReducer<ReturnType<typeof reducersNeedPersist>>(persistConfig, reducersNeedPersist)

export const store = configureStore({
  reducer: {
    persist: persistedReducer,
    modal: modalSlice.reducer,
    image: imageSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    })
  },
})
export const persistor = persistStore(store)

export * from './gameSlice'
export * from './imageSlice'
export * from './modalSlice'
