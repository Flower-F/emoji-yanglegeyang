import { random, remove, shuffle } from 'lodash-es'
import type { ReactNode } from 'react'

import { BLOCK_UNIT, BlockStatus, BOARD_UNIT, GameStatus } from '~/constants'
import { closeModal, openModal, setModalCloseOnOverlayClick, setModalContent } from '~/store'
import type { BlockType, BoardUnitType } from '~/types/block'

/** 统计是否需要删除槽内容 */
const slotsMap = new Map<string, BlockType[]>()
/** 保存棋盘每个格子的状态（下标为格子起始点横纵坐标） */
let board: BoardUnitType[][] = []
/** 用一个栈保存操作记录（存储点击的块） */
const operationsStack: BlockType[] = []
/** 当前占据的槽数 */
let currentSlotNum = 0

const useGame = (emojis: string[]) => {
  // 统一管理所有响应式状态
  const state = useReactive<{
    /** 每层的块 */
    levelBlocks: BlockType[]
    /** 插槽区 */
    slotBlocks: (BlockType | null)[]
    /** 随机区块 */
    randomBlocks: BlockType[][]
    /** 总块数 */
    totalBlockNum: number
    /** 消除的块数 */
    disappearedBlockNum: number
    /** 当前游戏状态 */
    gameStatus: GameStatus
    /** 是否可以透视随机区的块 */
    foresee: boolean
  }>({
        levelBlocks: [],
        slotBlocks: [],
        randomBlocks: [],
        totalBlockNum: 0,
        disappearedBlockNum: 0,
        gameStatus: GameStatus.READY,
        foresee: false,
      })

  const { gameConfig } = useSelector(store => store.persist.game)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  /** 初始化 board 数组 */
  const cleanBoard = (width: number, height: number) => {
    board = new Array<BoardUnitType[]>(width)
    for (let i = 0; i < width; i++) {
      board[i] = new Array(height)
      for (let j = 0; j < height; j++) {
        board[i][j] = {
          blocks: [],
        }
      }
    }
  }

  /** 辅助函数 给块绑定双向关系，用于确认哪些元素是当前可点击的 */
  const generateTwoWayRelation = (block: BlockType) => {
    // 可能产生重叠的范围
    const minX = Math.max(block.x - BLOCK_UNIT + 1, 0)
    const minY = Math.max(block.y - BLOCK_UNIT + 1, 0)
    const maxX = Math.min(block.x + BLOCK_UNIT - 1, BOARD_UNIT - BLOCK_UNIT)
    const maxY = Math.min(block.y + BLOCK_UNIT - 1, BOARD_UNIT - BLOCK_UNIT)

    // 遍历该块附近的格子
    let maxLevel = 0
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        const relationBlocks = board[i][j].blocks
        if (relationBlocks.length > 0) {
          // 取当前位置最高层的块
          const maxLevelRelationBlock = relationBlocks[relationBlocks.length - 1]
          // 排除自己
          if (maxLevelRelationBlock.id === block.id) {
            continue
          }

          maxLevel = Math.max(maxLevel, maxLevelRelationBlock.level)
          block.blocksHigherThan.push(maxLevelRelationBlock)
          maxLevelRelationBlock.blocksLowerThan.push(block)
        }
      }
    }

    // 比最高层的块再高一层（初始为 1）
    block.level = maxLevel + 1
  }

  /** 辅助函数 生成块坐标  */
  const generateLevelBlockPosition = (blocks: BlockType[], { minX, minY, maxX, maxY }: { minX: number; minY: number; maxX: number; maxY: number }) => {
    // 保证同一层块不会完全重叠
    const positionSet = new Set<string>()
    blocks.forEach((block) => {
      let newX, newY, key
      while (true) {
        newX = random(minX, maxX)
        newY = random(minY, maxY)
        key = `${newX},${newY}`
        if (!positionSet.has(key)) {
          break
        }
      }
      board[newX][newY].blocks.push(block)
      positionSet.add(key)
      block.x = newX
      block.y = newY
      generateTwoWayRelation(block)
    })
  }

  /** 初始化槽、随机区、分层区三部分数据，以及生成块总数 */
  const initBlocksData = () => {
    // 1. 规划块数：总块数必须是该值的倍数，才能确保可以生成答案
    const blockNumUnit = gameConfig.composedNum * emojis.length
    // 随机生成的总块数
    const totalRandomBlockNum = gameConfig.randomBlocks.reduce((prev, cur) => prev + cur)

    // 计算需要的最小块数
    const minBlockNum = gameConfig.levelNum * gameConfig.blockNumPerLevel + totalRandomBlockNum
    // 补齐到 blockNumUnit 的倍数
    state.totalBlockNum = minBlockNum
    if (state.totalBlockNum % blockNumUnit !== 0) {
      state.totalBlockNum = (Math.floor(minBlockNum / blockNumUnit) + 1) * blockNumUnit
    }

    // 保存所有块
    const allBlocks: BlockType[] = []

    // 2. 计算随机部分的块
    const emojiBlocks: string[] = []
    for (let i = 0; i < state.totalBlockNum; i++) {
      emojiBlocks.push(emojis[i % emojis.length])
    }
    const randomEmojis = shuffle(emojiBlocks)
    for (let i = 0; i < state.totalBlockNum; i++) {
      const newBlock: BlockType = {
        id: i,
        x: 0,
        y: 0,
        status: BlockStatus.READY,
        level: 0,
        emoji: randomEmojis[i],
        blocksHigherThan: [],
        blocksLowerThan: [],
      }
      allBlocks.push(newBlock)
    }

    let pos = 0
    const randomBlocks: BlockType[][] = []
    gameConfig.randomBlocks.forEach((randomBlock, index) => {
      randomBlocks[index] = []
      for (let i = 0; i < randomBlock; i++) {
        randomBlocks[index].push(allBlocks[pos])
        pos++
      }
    })

    // 剩余块数用于层级部分处理
    let restBlockNum = state.totalBlockNum - totalRandomBlockNum

    // 3. 计算层级部分的块
    const levelBlocks: BlockType[] = []
    const [minX, maxX, minY, maxY] = [0, BOARD_UNIT - BLOCK_UNIT, 0, BOARD_UNIT - BLOCK_UNIT]
    for (let i = 0; i < gameConfig.levelNum; i++) {
      let nextBlockNum = Math.min(gameConfig.blockNumPerLevel, restBlockNum)
      // 最后一批，分配剩下的所有块
      if (i === gameConfig.levelNum - 1) {
        nextBlockNum = restBlockNum
      }
      // 下一次要分配的块
      const nextBlocks = allBlocks.slice(pos, pos + nextBlockNum)
      levelBlocks.push(...nextBlocks)
      // 生成块坐标
      generateLevelBlockPosition(nextBlocks, { minX, minY, maxX, maxY })

      pos += nextBlockNum
      restBlockNum -= nextBlockNum
      if (restBlockNum <= 0) {
        break
      }
    }

    state.levelBlocks = levelBlocks
    state.slotBlocks = new Array<BlockType | null>(gameConfig.slotNum).fill(null)
    state.randomBlocks = randomBlocks
  }

  /** 开始游戏 */
  const startGame = () => {
    slotsMap.clear()
    cleanBoard(BOARD_UNIT - BLOCK_UNIT + 1, BOARD_UNIT - BLOCK_UNIT + 1)
    state.gameStatus = GameStatus.READY
    state.disappearedBlockNum = 0
    state.foresee = false
    currentSlotNum = 0
    operationsStack.length = 0
    initBlocksData()
    state.gameStatus = GameStatus.PLAYING
  }

  /** 辅助函数 弹窗内容 */
  const renderModalContent = (emoji: ReactNode, buttonText: string) => {
    return (
      <div flex flex-col items-center justify-center text-teal-9 mt-4>
        {emoji}
        <div font-extrabold mt-2 mb-1 text-xl>{buttonText}</div>
        <div text-sm mb-3>（广告位招租）</div>
        <button className="btn" flex items-center justify-center gap-1 onClick={() => {
          dispatch(closeModal())
          startGame()
        }}>
          <div>{t('game.retry')}</div>
          <div i-carbon-reset></div>
        </button>
      </div>
    )
  }

  /** 辅助函数，根据 slotsMap 生成当前的 slotBlocks */
  const generateSlotBlocks = () => {
    const newSlotBlocks: (BlockType | null)[] = []
    slotsMap.forEach((arr) => {
      arr.forEach((item) => {
        newSlotBlocks.push(item)
      })
    })
    currentSlotNum = newSlotBlocks.length
    while (newSlotBlocks.length < gameConfig.slotNum) {
      newSlotBlocks.push(null)
    }
    state.slotBlocks = newSlotBlocks
  }

  /**
   * 点击块事件
   * @param block 块
   * @param randomRowIndex 随机区域块所在的行数
   * @param randomColIndex 随机区域块所在的列数
   */
  const clickBlock = (block: BlockType, randomRowIndex = -1, randomColIndex = 0) => {
    if (currentSlotNum >= gameConfig.slotNum
      || block.status !== BlockStatus.READY
      || (block.blocksLowerThan.length > 0)
      || (randomColIndex !== 0 && !state.foresee)) {
      return
    }

    // 设置状态
    block.status = BlockStatus.DISAPPEARED

    // 将元素从分层区和随机区移除
    if (randomRowIndex >= 0) {
      operationsStack.length = 0
      if (state.foresee) {
        // 预知状态下之后可以随便移除随机区元素
        state.randomBlocks[randomRowIndex].splice(randomColIndex, 1)
      } else {
        // 否则只能移除所点击随机区域的第一个元素
        state.randomBlocks[randomRowIndex].shift()
      }
    } else {
      // 非随机区才可撤回
      operationsStack.push(block)
      // 移除覆盖关系
      block.blocksHigherThan.forEach((blockHigher) => {
        remove(blockHigher.blocksLowerThan, blockLower => blockLower.id === block.id)
      })
    }

    if (!slotsMap.has(block.emoji)) {
      slotsMap.set(block.emoji, [])
    }
    slotsMap.get(block.emoji)?.push(block)

    const arr = slotsMap.get(block.emoji)
    if (arr && arr.length >= gameConfig.composedNum) {
      // 消除成功，不可以再撤回了
      operationsStack.length = 0
      for (let i = 0; i < gameConfig.composedNum; i++) {
        arr.shift()
        state.disappearedBlockNum++
      }
      if (arr.length === 0) {
        slotsMap.delete(block.emoji)
      }
    }

    generateSlotBlocks()

    if (currentSlotNum >= gameConfig.slotNum) {
      // 你输了
      state.gameStatus = GameStatus.FAILED
      dispatch(setModalContent(renderModalContent(<div i-carbon-face-dizzy-filled text-2xl></div>, t('game.failed'))))
      dispatch(setModalCloseOnOverlayClick(false))
      dispatch(openModal())
    }
    if (state.disappearedBlockNum >= state.totalBlockNum) {
      // 你赢了
      state.gameStatus = GameStatus.SUCCESS
      dispatch(setModalContent(renderModalContent(<div i-carbon-face-wink-filled text-2xl></div>, t('game.success'))))
      dispatch(openModal())
    }
  }

  /** 打乱：打乱分层区的块 */
  const shuffleSkill = () => {
    const existBlocks = state.levelBlocks.filter(item => item.status === BlockStatus.READY)
    const newEmojis = shuffle(existBlocks.map(block => block.emoji))
    existBlocks.forEach((block, index) => {
      block.emoji = newEmojis[index]
    })
  }

  /** 预知：透视随机区的块 */
  const foreseeSkill = () => {
    state.foresee = true
  }

  /** 撤回：撤回上一步操作 */
  const undoSkill = () => {
    if (operationsStack.length < 1) {
      return
    }
    const item = operationsStack.pop()
    if (item) {
      item.status = BlockStatus.READY
      slotsMap.get(item.emoji)?.pop()
      generateSlotBlocks()
    }
  }

  /** 毁灭：消除一组块 */
  const destroySkill = () => {
    const blocks = state.levelBlocks.filter(block => block.status === BlockStatus.READY)

    const levelBlocksMap = new Map<string, BlockType[]>()
    for (let i = 0; i < blocks.length; i++) {
      if (!levelBlocksMap.has(blocks[i].emoji)) {
        levelBlocksMap.set(blocks[i].emoji, [])
      }

      const emojiBlocks = levelBlocksMap.get(blocks[i].emoji)

      if (emojiBlocks) {
        emojiBlocks.push(blocks[i])
        if (emojiBlocks.length >= gameConfig.composedNum) {
          operationsStack.length = 0
          emojiBlocks.forEach((block) => {
            state.disappearedBlockNum++
            block.status = BlockStatus.DISAPPEARED
            block.blocksHigherThan.forEach((blockHigher) => {
              remove(blockHigher.blocksLowerThan, blockLower => blockLower.id === block.id)
            })
          })
          break
        }
      }
    }
  }

  return {
    levelBlocks: state.levelBlocks,
    slotBlocks: state.slotBlocks,
    randomBlocks: state.randomBlocks,
    gameStatus: state.gameStatus,
    totalBlockNum: state.totalBlockNum,
    disappearedBlockNum: state.disappearedBlockNum,
    foresee: state.foresee,
    startGame: useMemoizedFn(startGame),
    clickBlock: useMemoizedFn(clickBlock),
    shuffleSkill: useMemoizedFn(shuffleSkill),
    foreseeSkill: useMemoizedFn(foreseeSkill),
    undoSkill: useMemoizedFn(undoSkill),
    destroySkill: useMemoizedFn(destroySkill),
  }
}

export default useGame
