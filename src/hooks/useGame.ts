import { random, shuffle } from 'lodash-es'

import { BlockStatus, GameStatus } from '~/constants'
import type { BlockType, BoardUnitType } from '~/types/block'
import type { GameConfig } from '~/types/game'

// 总共划分 24 x 24 的格子，每个块占 3 x 3 的格子，生成的起始 x 坐标和 y 坐标范围均为 0 ~ 20
const BOARD_UNIT = 24
const BLOCK_UNIT = 3
// 每个格子的宽高
const UNIT_SIZE = 14

const useGame = (gameConfig: GameConfig, emojis: string[], levelBoardDom: HTMLDivElement | null = null) => {
  // 每层的块
  const levelBlocks = useRef<BlockType[]>([])
  // 插槽区
  const slotBlocks = useRef<(BlockType | null)[]>([])
  // 随机区块
  const randomBlocks = useRef<BlockType[][]>([])
  // 总块数
  const totalBlockNum = useRef(0)
  // 消除的块数
  // const disappearedBlockNum = useRef(0)
  // 当前游戏状态
  const gameStatus = useRef(GameStatus.READY)

  // 保存所有块（包括随机块）
  const allBlocks: BlockType[] = []
  const blockData: Record<number, BlockType> = {}

  // 当前占据的槽数
  // const currentSlotNum = 0

  // 保存棋盘每个格子的状态（下标为格子起始点横纵坐标）
  const board: BoardUnitType[][] = new Array(BOARD_UNIT).fill(null).map(() => new Array<BoardUnitType>(BOARD_UNIT).fill({ blocks: [] }))
  // 操作记录（存储点击的块）
  // const operationRecord: BlockType[] = []

  /** 给块绑定双向关系，用于确认哪些元素是当前可点击的 */
  const generateTwoWayRelation = (block: BlockType) => {
    // 确定该块附近的格子坐标范围
    const minX = Math.max(block.x - BLOCK_UNIT, 0)
    const minY = Math.max(block.y - BLOCK_UNIT, 0)
    const maxX = Math.min(block.x + BLOCK_UNIT, BOARD_UNIT - BLOCK_UNIT - 1)
    const maxY = Math.min(block.y + BLOCK_UNIT, BOARD_UNIT - BLOCK_UNIT - 1)

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
  const generateBlocksPosition = (blocks: BlockType[], minX: number, minY: number, maxX: number, maxY: number) => {
    // 保证同批次块不会完全重叠
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

  /** 游戏初始化 */
  const initGame = () => {
    // 设置 levelBoard 宽度
    if (levelBoardDom) {
      levelBoardDom.style.width = `${UNIT_SIZE * BOARD_UNIT}px`
      levelBoardDom.style.height = `${UNIT_SIZE * BOARD_UNIT}px`
    }

    // 1. 规划块数
    // 总块数必须是该值的倍数，才能确保可以生成答案
    const blockNumUnit = gameConfig.composedNum * emojis.length
    // 随机生成的总块数
    const totalRandomBlockNum = gameConfig.randomBlocks.reduce((prev, cur) => prev + cur)
    // 计算需要的最小块数
    const minBlockNum = gameConfig.levelNum * gameConfig.blockNumPerLevel + totalRandomBlockNum
    // 补齐到 blockNumUnit 的倍数
    totalBlockNum.current = minBlockNum
    if (minBlockNum % blockNumUnit !== 0) {
      totalBlockNum.current = (Math.floor(minBlockNum / blockNumUnit) + 1) * blockNumUnit
    }

    // 2. 计算随机部分的块
    const emojiBlocks: string[] = []
    for (let i = 0; i < totalBlockNum.current; i++) {
      emojiBlocks.push(emojis[i % emojis.length])
    }
    const randomEmojis = shuffle(emojiBlocks)
    for (let i = 0; i < totalBlockNum.current; i++) {
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

    // 剩余块数，用于层级部分处理
    let restBlockNum = totalBlockNum.current - totalRandomBlockNum

    // 3. 计算层级部分的块
    const levelBlocks: BlockType[] = []
    let [minX, maxX, minY, maxY] = [0, BOARD_UNIT - BLOCK_UNIT, 0, BOARD_UNIT - BLOCK_UNIT]
    for (let i = 0; i < gameConfig.levelNum; i++) {
      let nextBlockNum = Math.min(gameConfig.blockNumPerLevel, restBlockNum)
      // 最后一批，分配剩下的所有块
      if (i === gameConfig.levelNum - 1) {
        nextBlockNum = restBlockNum
      }
      // 边界收缩
      if (gameConfig.borderStep > 0) {
        const remainder = i % 4
        if (remainder === 0) {
          minX += gameConfig.borderStep
        } else if (remainder === 1) {
          maxY -= gameConfig.borderStep
        } else if (remainder === 2) {
          minY += gameConfig.borderStep
        } else {
          maxX -= gameConfig.borderStep
        }
      }
      const nextBlocks = allBlocks.slice(pos, pos + nextBlockNum)
      levelBlocks.push(...nextBlocks)
      // 生成块坐标
      generateBlocksPosition(nextBlocks, minX, minY, maxX, maxY)

      pos = pos + nextBlockNum
      restBlockNum -= nextBlockNum
      if (restBlockNum <= 0) {
        break
      }
    }

    return {
      levelBlocks,
      slotBlocks: new Array<BlockType | null>(gameConfig.slotNum).fill(null),
      randomBlocks,
    }
  }

  /** 开始游戏 */
  const startGame = () => {
    gameStatus.current = GameStatus.READY
    const result = initGame()
    levelBlocks.current = result.levelBlocks
    slotBlocks.current = result.slotBlocks
    randomBlocks.current = result.randomBlocks
    gameStatus.current = GameStatus.PLAYING
  }

  /** 点击块事件 */
  // const clickBlock = (block: BlockType, randomIndex = -1, force = false) => {
  //   if (currentSlotNum >= gameConfig.slotNum || block.status !== BlockStatus.READY || (block.blocksHigherThan.length > 0 && !force)) {
  //     return
  //   }

  //   // 移除当前元素
  //   block.status = BlockStatus.CLICKED
  //   if (randomIndex >= 0) {
  //     // 移除所点击的随机区域的第一个元素
  //     randomBlocks.current[randomIndex] = randomBlocks.current[randomIndex].slice(1)
  //   } else {
  //     // 非随机区才可撤回
  //     operationRecord.push(block)
  //     // 移除覆盖关系
  //     block.blocksHigherThan.forEach((blockHigher) => {
  //       remove(blockHigher.blocksLowerThan, blockLower => blockLower.id === block.id)
  //     })
  //   }

  //   // 新元素加入插槽
  //   slotBlocks.current[currentSlotNum] = block
  //   // 检查是否可以消除
  //   const map = new Map<string, number>()
  //   slotBlocks.current.forEach((slotBlock) => {
  //     const emoji = slotBlock?.emoji
  //     if (emoji) {
  //       map.set(emoji, (map.get(emoji) || 0) + 1)
  //     }
  //   })

  //   const newSlotBlocks = new Array<BlockType | null>(gameConfig.slotNum).fill(null)
  //   newSlotBlocks.forEach((slotBlock) => {
  //     if (slotBlock && map.get(slotBlock.emoji) >= gameConfig.composedNum) {
  //       slotBlock.status = BlockStatus.DISAPPEARED
  //       disappearedBlockNum.current++
  //       operationRecord.length = 0
  //     }
  //     newSlotBlocks[currentSlotNum + 1] = slotBlock
  //   })
  //   currentSlotNum = currentSlotNum + 1

  //   if (currentSlotNum >= gameConfig.slotNum) {
  //     gameStatus.current = GameStatus.FAILED
  //     // 你输了
  //   }
  //   if (disappearedBlockNum >= totalBlockNum) {
  //     gameStatus.current = GameStatus.SUCCESS
  //     // 你赢了
  //   }
  // }

  return {
    startGame: useMemoizedFn(startGame),
    levelBlocks,
    slotBlocks,
    randomBlocks,
    gameStatus,
  }
}

export default useGame
