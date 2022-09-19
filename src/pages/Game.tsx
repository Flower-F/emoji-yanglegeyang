import type { CSSProperties } from 'react'

import { BLOCK_UNIT, BlockStatus, BOARD_UNIT, GameStatus } from '~/constants'
import { setImages } from '~/store'
import type { BlockType } from '~/types/block'

type ImageModule = typeof import('*.png')
type ImportModuleFunction = () => Promise<ImageModule>

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map(importFn => importFn())
  const loadedModules = await Promise.all(imports)
  return loadedModules.map(module => module.default)
}

/** 每个格子的宽高，单位 px */
const UNIT_SIZE = 14

const GamePage = () => {
  const { images } = useSelector(store => store.image)
  const { gameConfig } = useSelector(store => store.persist.game)
  const {
    levelBlocks,
    slotBlocks,
    randomBlocks,
    gameStatus,
    totalBlockNum,
    disappearedBlockNum,
    startGame,
    clickBlock,
  } = useGame(gameConfig, images)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loadImage = useMemoizedFn(async () => {
    const modules = import.meta.glob<ImageModule>('~/assets/*.png')
    const images = await resolveImportGlobModule(modules)
    dispatch(setImages(images))
  })

  useEffect(() => {
    loadImage().then(() => {
      startGame()
    })
  }, [loadImage, startGame])

  const levelBlockStyle = useMemoizedFn((item: BlockType) => {
    return {
      zIndex: item.level + 10,
      left: `${item.x * UNIT_SIZE}px`,
      top: `${item.y * UNIT_SIZE}px`,
      backgroundColor: item.blocksLowerThan.length > 0 ? '#707c69' : '#fff',
      cursor: item.blocksLowerThan.length > 0 ? 'not-allowed' : 'pointer',
      width: `${UNIT_SIZE * BLOCK_UNIT}px`,
      height: `${UNIT_SIZE * BLOCK_UNIT}px`,
    } as CSSProperties
  })

  const levelBlockImageStyle = useMemoizedFn((item: BlockType) => {
    return {
      opacity: item.blocksLowerThan.length > 0 ? '0.6' : '1',
    } as CSSProperties
  })

  const boardStyle = useMemoizedFn(() => {
    return {
      width: `${UNIT_SIZE * BOARD_UNIT}px`,
      height: `${UNIT_SIZE * BOARD_UNIT}px`,
    } as CSSProperties
  })

  const containerStyle = useMemoizedFn(() => {
    return {
      maxWidth: `${UNIT_SIZE * BOARD_UNIT + 25}px`,
    } as CSSProperties
  })

  return (
    <div mx-auto flex flex-col justify-center items-center gap-4 style={containerStyle()}>
      {/* 分数部分 */}
      <div flex justify-between items-center w-full>
        <div flex gap-2 text-white bg-teal-6 p="x2 y1.5" rounded>
          <button i-carbon-previous-outline w-6 h-6 rounded-full cursor-pointer hover:text-teal-1 onClick={() => navigate(-1)}></button>
          <div mx-2px w-2px bg-white></div>
          <button i-carbon-reset w-6 h-6 cursor-pointer hover:text-teal-1 onClick={startGame}></button>
        </div>
        <div className="btn" cursor-none select-none>{disappearedBlockNum} / {totalBlockNum}</div>
      </div>
      {
        gameStatus > GameStatus.READY && images.length > 0
          ? (
              <div border-teal-5 border-4 px-10px py-4 rounded-4 bg-teal-1>
                {/* 分层部分 */}
                <div relative style={boardStyle()}>
                  {
                    levelBlocks.map((item, index) => (
                      item.status === BlockStatus.READY && (
                        <button absolute rounded-2 border-teal-4 border-2 p-1px key={index} style={levelBlockStyle(item)} onClick={() => clickBlock(item)}>
                          <img w-full h-full src={item.emoji} alt={`Layer emoji${index}`} style={levelBlockImageStyle(item)} />
                        </button>
                      )
                    ))
                  }
                </div>
                {/* 随机部分 */}
                <div mt-2 flex gap-2 flex-col pt-2>
                  {
                    randomBlocks.map((randomBlock, outIndex) => (
                      randomBlock.length > 0 && (
                        <div key={outIndex} flex flex-wrap justify-center items-center gap-2 bg-teal-4 p-6px mx-auto rounded-2>
                          {
                            randomBlock.map((item, index) => (
                              <button key={index} rounded-2 bg-white w-36px h-36px onClick={() => clickBlock(item, outIndex)}>
                                {
                                  index === 0
                                    ? <img src={item.emoji} w-full h-full rounded-2 alt={`Random emoji${index}`} />
                                    : <div w-full h-full bg-gray400 rounded-2></div>
                                  }
                              </button>
                            ))
                          }
                        </div>
                      )
                    ))
                  }
                </div>
            </div>
            )
          : <div>Loading...</div>
      }
      {/* 槽 */}
      <div flex flex-wrap gap-2 justify-center items-center max-w-240px bg-teal-1 p-4 rounded-4 border-teal-5 border-4>
        {
          slotBlocks.map((item, index) => (
            <div key={index}>
              {
                item
                  ? <div w-10 h-10 bg-white rounded-2 p-1px border-teal-4 border-2>
                      <img src={item.emoji} w-full h-full rounded-2 alt={`Emoji${index}`} />
                    </div>
                  : <div w-10 h-10 bg-gray400 rounded-2></div>
                }
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default GamePage
