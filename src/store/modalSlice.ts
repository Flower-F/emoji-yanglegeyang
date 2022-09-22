import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { ReactNode } from 'react'

const namespace = 'modal'

interface ModalState {
  /** 弹窗状态 */
  isOpen: boolean
  /** 点击背景是否关闭 */
  closeOnOverlayClick: boolean
  /** 弹窗内容 */
  content: ReactNode
}

const initialState: ModalState = {
  isOpen: false,
  closeOnOverlayClick: true,
  content: null,
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
      state.closeOnOverlayClick = true
    },
    setModalContent: (state: ModalState, action: PayloadAction<ReactNode>) => {
      state.content = action.payload
    },
    banModalCloseOnOverlayClick: (state: ModalState) => {
      state.closeOnOverlayClick = false
    },
  },
})

export const { openModal, closeModal, setModalContent, banModalCloseOnOverlayClick } = modalSlice.actions
