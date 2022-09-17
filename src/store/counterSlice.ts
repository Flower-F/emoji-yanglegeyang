import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const namespace = 'counter'

interface CounterState {
  count: number
}

const initialState: CounterState = {
  count: 0,
}

export const counterSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setCount: (state: CounterState, action: PayloadAction<number>) => {
      state.count = action.payload
    },
  },
})

export const { setCount } = counterSlice.actions
