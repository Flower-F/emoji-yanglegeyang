import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const namespace = 'music'

interface MusicState {
  /** 音乐播放状态 */
  isPlaying: boolean
  /** 音乐源 */
  source: string
}

const initialState: MusicState = {
  isPlaying: false,
  source: '',
}

export const musicSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    openMusic: (state: MusicState) => {
      state.isPlaying = true
    },
    closeMusic: (state: MusicState) => {
      state.isPlaying = false
    },
    setMusicSource: (state: MusicState, action: PayloadAction<string>) => {
      state.source = action.payload
    },
  },
})

export const { openMusic, closeMusic, setMusicSource } = musicSlice.actions
