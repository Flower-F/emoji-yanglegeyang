import { BlockStatus } from '~/constants'

/** 块类型 */
export interface BlockType {
  id: number
  /** x 坐标 */
  x: number
  /** y 坐标 */
  y: number
  /** 层级 */
  level: number
  /** 对应的表情 */
  emoji: string
  /** 状态：正常，已点击，已消除 */
  status: BlockStatus
  /** 压住哪些块 */
  blocksHigherThan: BlockType[]
  /** 被哪些块压住（为空表示可点击） */
  blocksLowerThan: BlockType[]
}

/** 每个格子单元类型 */
export interface BoardUnitType {
  blocks: BlockType[];
}
