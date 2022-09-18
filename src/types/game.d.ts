/** 游戏配置 */
export interface GameConfig {
  /** 槽数 */
  slotNum: number
  /** 需要多少个一样的块才能消除  */
  composedNum: number
  /** 每层块数（大致） */
  blockNumPerLevel: number
  /** 总层数（最小为 2） */
  levelNum: number
  /** 随机区块数（数组长度代表有多少条随机区，值表示每条随机区有多少块） */
  randomBlocks: number[]
}
