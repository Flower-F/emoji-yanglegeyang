import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import autoMergeLevel from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'

import { counterSlice } from './counterSlice'

const persistConfig = {
  key: 'persist-key',
  storage,
  stateReconciler: autoMergeLevel,
}

const reducers = combineReducers({
  counter: counterSlice.reducer,
})
const persistedReducer = persistReducer<ReturnType<typeof reducers>>(persistConfig, reducers)

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
