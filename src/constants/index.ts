export * from './gameConfig'
export * from './gameEnum'

// 总共划分 24 x 24 的格子，每个块占 3 x 3 的格子，生成的起始 x 坐标和 y 坐标范围均为 0 ~ 21
export const BOARD_UNIT = 24
export const BLOCK_UNIT = 3
// 每个格子的宽高，单位 px
export const UNIT_SIZE = 14
