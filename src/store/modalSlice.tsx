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
      state.closeOnOverlayClick = false
    },
    setModalContent: (state: ModalState, action: PayloadAction<ReactNode>) => {
      state.content = action.payload
    },
    setModalCloseOnOverlayClick: (state: ModalState, action: PayloadAction<boolean>) => {
      state.closeOnOverlayClick = action.payload
    },
  },
})

export const { openModal, closeModal, setModalContent, setModalCloseOnOverlayClick } = modalSlice.actions
