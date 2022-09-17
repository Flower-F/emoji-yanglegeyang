/** 简单 */
export const easyGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 10,
  borderStep: 1,
  levelNum: 6,
  randomBlocks: [4, 4],
}

/** 中等 */
export const mediumGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 12,
  borderStep: 1,
  levelNum: 7,
  randomBlocks: [5, 5],
}

/** 困难 */
export const hardGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 16,
  borderStep: 1,
  levelNum: 8,
  randomBlocks: [6, 6],
}

/** 地狱 */
export const hellGameConfig: GameConfig = {
  slotNum: 7,
  composedNum: 3,
  blockNumPerLevel: 20,
  borderStep: 2,
  levelNum: 10,
  randomBlocks: [8, 8],
}

/** 根据难度获取配置 */
export const getGameConfig = (config: Difficulty) => {
  switch (config) {
    case 'medium':
      return mediumGameConfig
    case 'hard':
      return hardGameConfig
    case 'hell':
      return hellGameConfig
    default:
      return easyGameConfig
  }
}
