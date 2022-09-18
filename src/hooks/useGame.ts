import { random, remove, shuffle } from 'lodash-es'

import { BLOCK_UNIT, BlockStatus, BOARD_UNIT, GameStatus } from '~/constants'
import type { BlockType, BoardUnitType } from '~/types/block'
import type { GameConfig } from '~/types/game'

const useGame = (gameConfig: GameConfig, emojis: string[]) => {
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
    /** 当前占据的槽数 */
    currentSlotNum: number
  }>({
        levelBlocks: [],
        slotBlocks: [],
        randomBlocks: [],
        totalBlockNum: 0,
        disappearedBlockNum: 0,
        gameStatus: GameStatus.READY,
        currentSlotNum: 0,
      })

  // 保存所有块（包括随机区、分层区）
  const allBlocks: BlockType[] = []
  const blockData: Record<number, BlockType> = {}

  // 保存棋盘每个格子的状态（下标为格子起始点横纵坐标）
  let board: BoardUnitType[][] = []
  // 操作记录（存储点击的块）
  const operationRecord: BlockType[] = []

  /** 初始化 */
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
  initBoard(BOARD_UNIT, BOARD_UNIT)

  /** 给块绑定双向关系，用于确认哪些元素是当前可点击的 */
  const generateTwoWayRelation = (block: BlockType) => {
    // 可能产生重叠的范围
    const minX = Math.max(block.x - BLOCK_UNIT + 1, 0)
    const minY = Math.max(block.y - BLOCK_UNIT + 1, 0)
    const maxX = Math.min(block.x + BLOCK_UNIT, BOARD_UNIT - BLOCK_UNIT)
    const maxY = Math.min(block.y + BLOCK_UNIT, BOARD_UNIT - BLOCK_UNIT)

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

  /** 生成块坐标  */
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
        blockData[pos] = allBlocks[pos]
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
    initBoard(BOARD_UNIT, BOARD_UNIT)
    state.gameStatus = GameStatus.READY
    state.disappearedBlockNum = 0
    state.currentSlotNum = 0
    initGame()
    state.gameStatus = GameStatus.PLAYING
  }

  /** 点击块事件 */
  const clickBlock = (block: BlockType, randomIndex = -1, force = false) => {
    if (state.currentSlotNum >= gameConfig.slotNum || block.status !== BlockStatus.READY || (block.blocksLowerThan.length > 0 && !force)) {
      return
    }

    // 设置状态
    block.status = BlockStatus.CLICKED
    if (randomIndex >= 0) {
      // 移除所点击的随机区域的第一个元素
      state.randomBlocks[randomIndex].shift()
    } else {
      // 非随机区才可撤回
      operationRecord.push(block)
      // 移除覆盖关系
      block.blocksHigherThan.forEach((blockHigher) => {
        remove(blockHigher.blocksLowerThan, blockLower => blockLower.id === block.id)
      })
    }

    // 新元素加入插槽
    state.slotBlocks[state.currentSlotNum] = block

    const notNullSlotBlocks = state.slotBlocks.filter(
      slotBlock => !!slotBlock,
    )

    // 检查是否形成了可消除组合，并进行消除
    const map = new Map<string, number>()
    notNullSlotBlocks.forEach((slotBlock) => {
      const emoji = slotBlock?.emoji
      if (emoji) {
        map.set(emoji, (map.get(emoji) || 0) + 1)
      }
    })
    let newSlotNum = 0
    const newSlotBlocks = new Array<BlockType | null>(gameConfig.slotNum).fill(null)
    notNullSlotBlocks.forEach((slotBlock, index) => {
      if (slotBlock) {
        newSlotNum++
        const emojiNum = map.get(slotBlock.emoji)
        if (emojiNum !== undefined && emojiNum >= gameConfig.composedNum) {
          // 消除元素
          slotBlock.status = BlockStatus.DISAPPEARED
          state.disappearedBlockNum++
          // 避免撤回
          operationRecord.length = 0
        } else {
          newSlotBlocks[index] = slotBlock
        }
      }
    })
    state.slotBlocks = newSlotBlocks
    state.currentSlotNum = newSlotNum

    if (state.currentSlotNum >= gameConfig.slotNum) {
      state.gameStatus = GameStatus.FAILED
      // 你输了
      // console.log('fail')
    }
    if (state.disappearedBlockNum >= state.totalBlockNum) {
      state.gameStatus = GameStatus.SUCCESS
      // 你赢了
      // console.log('win')
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
