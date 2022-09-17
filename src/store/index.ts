import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import autoMergeLevel from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'

import { counterSlice } from './counterSlice'
import { gameSlice } from './gameSlice'
import { imageSlice } from './imageSlice'

const persistConfig = {
  key: 'global',
  storage,
  stateReconciler: autoMergeLevel,
}

const reducersNeedPersist = combineReducers({
  counter: counterSlice.reducer,
  game: gameSlice.reducer,
  image: imageSlice.reducer,
})
const persistedReducer = persistReducer<ReturnType<typeof reducersNeedPersist>>(persistConfig, reducersNeedPersist)

export const store = configureStore({
  reducer: {
    persist: persistedReducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    })
  },
})
export const persistor = persistStore(store)

export * from './counterSlice'
export * from './gameSlice'
export * from './imageSlice'
