import { random } from 'lodash-es'

import type { EmojiType } from '~/types/emoji'

const operationsStack: {
  index: { [key in EmojiType]: number }
  tab: EmojiType
} [] = []

const useEmoji = () => {
  // 统一管理所有响应式状态
  const state = useReactive<{
    /** 当前选择的 tab */
    selectedTab: EmojiType
    /** 当前的图片集合 */
    images: { [key in EmojiType]: string[] }
    /** 当前表情 */
    emojiIndex: { [key in EmojiType]: number }
  }>({
    selectedTab: 'head',
    images: {
      head: [],
      eyes: [],
      eyebrows: [],
      mouth: [],
      detail: [],
    },
    emojiIndex: {
      head: 0,
      eyes: 0,
      eyebrows: 0,
      mouth: 0,
      detail: 0,
    },
  })

  /** 选择逻辑 */
  const selectItem = ({ tab, index }: { tab: EmojiType; index: number }) => {
    if (operationsStack.length > 0 && operationsStack[operationsStack.length - 1].tab === tab && state.emojiIndex[tab] === index) {
      return
    }
    state.emojiIndex[tab] = index
    operationsStack.push({
      index: state.emojiIndex,
      tab,
    })
  }

  /** 随机生成函数 */
  const getRandom = () => {
    const randomIndex = {
      head: random(0, state.images.head.length - 1),
      eyes: random(0, state.images.eyes.length - 1),
      eyebrows: random(0, state.images.eyebrows.length - 1),
      mouth: random(0, state.images.mouth.length - 1),
      detail: random(0, state.images.detail.length - 1),
    }
    state.emojiIndex = randomIndex
    operationsStack.push({
      index: randomIndex,
      tab: state.selectedTab,
    })
  }

  /** 撤回操作 */
  const undo = useMemoizedFn(() => {
    if (operationsStack.length < 2) {
      return
    }
    state.emojiIndex = operationsStack[operationsStack.length - 2].index
    operationsStack.pop()
  })

  /** 选择 tab */
  const setSelectedTab = (tab: EmojiType) => {
    state.selectedTab = tab
  }

  /** 选择图片 */
  const setCurrentImages = (images: { [key in EmojiType]: string[] }) => {
    state.images = images
  }

  return {
    currentEmoji: {
      head: state.images.head[state.emojiIndex.head],
      eyes: state.images.eyes[state.emojiIndex.eyes],
      eyebrows: state.images.eyebrows[state.emojiIndex.eyebrows],
      mouth: state.images.mouth[state.emojiIndex.mouth],
      detail: state.images.detail[state.emojiIndex.detail],
    },
    currentImages: state.images,
    emojiIndex: state.emojiIndex,
    selectedTab: state.selectedTab,
    selectItem: useMemoizedFn(selectItem),
    undo: useMemoizedFn(undo),
    getRandom: useMemoizedFn(getRandom),
    setSelectedTab: useMemoizedFn(setSelectedTab),
    setCurrentImages: useMemoizedFn(setCurrentImages),
  }
}

export default useEmoji
