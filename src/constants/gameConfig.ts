import { GameDifficulty } from '~/constants'
import type { GameConfig } from '~/types/game'

/** 简单 */
export const easyGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 10,
  levelNum: 6,
  randomBlocks: [4, 4],
}

/** 中等 */
export const mediumGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 12,
  levelNum: 7,
  randomBlocks: [5, 5],
}

/** 困难 */
export const hardGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 16,
  levelNum: 8,
  randomBlocks: [6, 6],
}

/** 地狱 */
export const hellGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 20,
  levelNum: 10,
  randomBlocks: [8, 8],
}

/** 羊了个羊难度 */
export const yanglegeyangConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 28,
  levelNum: 15,
  randomBlocks: [8, 8],
}

/** 根据难度获取配置 */
export const getGameConfig = (config: GameDifficulty) => {
  switch (config) {
    case GameDifficulty.EASY:
      return easyGameConfig
    case GameDifficulty.HARD:
      return hardGameConfig
    case GameDifficulty.HELL:
      return hellGameConfig
    case GameDifficulty.YANG_LE_GE_YANG:
      return yanglegeyangConfig
    default:
      return mediumGameConfig
  }
}
