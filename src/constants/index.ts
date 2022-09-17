/** 块状态 */
export enum BlockStatus {
  /** 初始化 */
  READY,
  /** 点击后 */
  CLICKED,
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
