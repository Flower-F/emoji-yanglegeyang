import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const namespace = 'music'

interface MusicState {
  /** 音乐播放状态 */
  isPlaying: boolean
  /** 音乐源 */
  source: string
  /** 重新设置音源 */
  reset: boolean
}

const initialState: MusicState = {
  isPlaying: false,
  source: '',
  reset: false,
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
      state.reset = true
    },
    maintainMusicSource: (state: MusicState) => {
      state.reset = false
    },
  },
})

export const { openMusic, closeMusic, setMusicSource, maintainMusicSource } = musicSlice.actions
