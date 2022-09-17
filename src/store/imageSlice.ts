import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

const namespace = 'image'

interface ImageState {
  images: string[]
}

const initialState: ImageState = {
  images: [],
}

export const imageSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setImages: (state: ImageState, action: PayloadAction<string[]>) => {
      state.images = action.payload
    },
  },
})

export const { setImages } = imageSlice.actions
