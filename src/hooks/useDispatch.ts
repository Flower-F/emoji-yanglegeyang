import { useDispatch as useAppDispatch } from 'react-redux'

import type { store } from '~/store'

type AppDispatch = typeof store.dispatch
export const useDispatch: () => AppDispatch = useAppDispatch
