import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { easyGameConfig } from '~/configs/difficulty'

const namespace = 'game'

interface IGameState {
  gameConfig: GameConfig
}

const initialState: IGameState = {
  gameConfig: easyGameConfig,
}

export const gameSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setGameConfig: (state: IGameState, action: PayloadAction<GameConfig>) => {
      state.gameConfig = action.payload
    },
  },
})

export const { setGameConfig } = gameSlice.actions
