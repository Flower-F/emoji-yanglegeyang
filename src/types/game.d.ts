/** 游戏配置 */
export interface GameConfig {
  /** 槽数 */
  slotNum: number
  /** 需要多少个一样的块才能消除  */
  composedNum: number
  /** 每层块数（大致） */
  blockNumPerLevel: number
  /** 边界收缩步长  */
  borderStep: number
  /** 总层数（最小为 2） */
  levelNum: number
  /** 随机区块数（数组长度代表随机区数量，值表示每个随机区生产多少块） */
  randomBlocks: number[]
}
