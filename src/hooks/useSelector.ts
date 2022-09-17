import type { TypedUseSelectorHook } from 'react-redux'
import { useSelector as useAppSelector } from 'react-redux'

import type { store } from '~/store'

type RootState = ReturnType<typeof store.getState>
export const useSelector: TypedUseSelectorHook<RootState> = useAppSelector
