import { random, remove, shuffle } from 'lodash-es'
import type { ReactNode } from 'react'

import { BLOCK_UNIT, BlockStatus, BOARD_UNIT, GameStatus } from '~/constants'
import { closeModal, openModal, setModalCloseOnOverlayClick, setModalContent } from '~/store'
import type { BlockType, BoardUnitType } from '~/types/block'

/** 统计是否需要删除槽内容 */
const slotsMap = new Map<string, BlockType[]>()
/** 保存棋盘每个格子的状态（下标为格子起始点横纵坐标） */
let board: BoardUnitType[][] = []
/** 保存操作记录（存储点击的块） */
const operationRecord: BlockType[] = []
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
  }>({
        levelBlocks: [],
        slotBlocks: [],
        randomBlocks: [],
        totalBlockNum: 0,
        disappearedBlockNum: 0,
        gameStatus: GameStatus.READY,
      })

  const { gameConfig } = useSelector(store => store.persist.game)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  /** 初始化 board 数组 */
  const initBoard = (width: number, height: number) => {
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

  /** 初始化槽、随机区、分层区三部分数据 */
  const initGame = () => {
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
    initBoard(BOARD_UNIT - BLOCK_UNIT + 1, BOARD_UNIT - BLOCK_UNIT + 1)
    state.gameStatus = GameStatus.READY
    state.disappearedBlockNum = 0
    currentSlotNum = 0
    initGame()
    state.gameStatus = GameStatus.PLAYING
  }

  /** 辅助函数 弹窗内容 */
  const renderModalContent = (emoji: ReactNode, buttonText: string) => {
    return (
      <div flex flex-col items-center justify-center text-teal-9 mt-4>
        {emoji}
        <div font-extrabold m="t2 b3" text-xl>{buttonText}</div>
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

  /**
   * 点击块事件
   * @param block 块
   * @param randomRowIndex 随机区域块所在的行数
   * @param randomColIndex 随机区域块所在的列数
   * @param force 是否强制删除，用于技能区
   */
  const clickBlock = (block: BlockType, randomRowIndex = -1, randomColIndex = 0, force = false) => {
    if (currentSlotNum >= gameConfig.slotNum || block.status !== BlockStatus.READY || (block.blocksLowerThan.length > 0 && !force) || randomColIndex !== 0) {
      return
    }

    // 设置状态
    block.status = BlockStatus.CLICKED
    if (randomRowIndex >= 0) {
      // 移除所点击的随机区域的第一个元素
      state.randomBlocks[randomRowIndex].shift()
    } else {
      // 非随机区才可撤回
      operationRecord.push(block)
      // 移除覆盖关系
      block.blocksHigherThan.forEach((blockHigher) => {
        remove(blockHigher.blocksLowerThan, blockLower => blockLower.id === block.id)
      })
    }

    // 新元素加入插槽
    state.slotBlocks[currentSlotNum] = block
    if (!slotsMap.has(block.emoji)) {
      slotsMap.set(block.emoji, [])
    }
    slotsMap.get(block.emoji)?.push(block)

    const arr = slotsMap.get(block.emoji)
    if (arr && arr.length >= gameConfig.composedNum) {
      // 消除成功，不可以再撤回了
      operationRecord.length = 0
      for (let i = 0; i < gameConfig.composedNum; i++) {
        arr.shift()
        state.disappearedBlockNum++
      }
      if (arr.length === 0) {
        slotsMap.delete(block.emoji)
      }
    }

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

  return {
    levelBlocks: state.levelBlocks,
    slotBlocks: state.slotBlocks,
    randomBlocks: state.randomBlocks,
    gameStatus: state.gameStatus,
    totalBlockNum: state.totalBlockNum,
    disappearedBlockNum: state.disappearedBlockNum,
    startGame: useMemoizedFn(startGame),
    clickBlock: useMemoizedFn(clickBlock),
  }
}

export default useGame
