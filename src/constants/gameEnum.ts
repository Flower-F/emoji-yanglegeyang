/** 块状态 */
export enum BlockStatus {
  /** 初始化 */
  READY,
  /** 消失 */
  DISAPPEARED,
}

/** 游戏难度 */
export enum GameDifficulty {
  /** 简单 */
  EASY,
  /** 中等 */
  MEDIUM,
  /** 困难 */
  HARD,
  /** 地狱 */
  HELL,
  /** 羊了个羊 */
  YANG_LE_GE_YANG,
}

/** 游戏状态 */
export enum GameStatus {
  /** 初始化 */
  READY,
  /** 进行中 */
  PLAYING,
  /** 失败 */
  FAILED,
  /** 胜利 */
  SUCCESS,
}
