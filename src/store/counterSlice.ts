import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const namespace = 'counter'

interface ICounterState {
  count: number
}

const initialState: ICounterState = {
  count: 0,
}

export const counterSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setCount: (state: ICounterState, action: PayloadAction<number>) => {
      state.count = action.payload
    },
  },
})

export const { setCount } = counterSlice.actions
