import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { ReactNode } from 'react'

const namespace = 'modal'

interface ModalState {
  isOpen: boolean
  content: ReactNode
}

const initialState: ModalState = {
  isOpen: false,
  content: <div></div>,
}

export const modalSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    openModal: (state: ModalState) => {
      state.isOpen = true
    },
    closeModal: (state: ModalState) => {
      state.isOpen = false
    },
    setModalContent: (state: ModalState, action: PayloadAction<ReactNode>) => {
      state.content = action.payload
    },
  },
})

export const { openModal, closeModal, setModalContent } = modalSlice.actions
