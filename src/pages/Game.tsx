import type { CSSProperties } from 'react'

import { BLOCK_UNIT, BlockStatus, BOARD_UNIT, easyGameConfig, GameStatus, UNIT_SIZE } from '~/constants'
import { setImages } from '~/store'
import type { BlockType } from '~/types/block'

type ImageModule = typeof import('*.png')
type ImportModuleFunction = () => Promise<ImageModule>

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map(importFn => importFn())
  const loadedModules = await Promise.all(imports)
  return loadedModules.map(module => module.default)
}

const GamePage = () => {
  const { images } = useSelector(store => store.persist.image)
  const {
    startGame,
    levelBlocks,
    // slotBlocks,
    // randomBlocks,
    gameStatus,
    totalBlockNum,
    disappearedBlockNum,
  } = useGame(easyGameConfig, images)

  const dispatch = useDispatch()

  const loadImage = useMemoizedFn(async () => {
    const modules = import.meta.glob<ImageModule>('~/assets/*.png')
    const images = await resolveImportGlobModule(modules)
    dispatch(setImages(images))
  })

  useEffect(() => {
    if (images.length === 0) {
      loadImage()
    }
  }, [images.length, loadImage])

  useEffect(() => {
    startGame()
  }, [startGame, images])

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

  const windowStyle = useMemoizedFn(() => {
    return {
      width: `${UNIT_SIZE * BOARD_UNIT}px`,
      height: `${UNIT_SIZE * BOARD_UNIT}px`,
    } as CSSProperties
  })

  return (
    <>
      {/* 分数部分 */}
      <div flex justify-end mx-auto max-w-600px>
        <div className="btn" cursor-none select-none>{disappearedBlockNum} / {totalBlockNum}</div>
      </div>
      {/* 分层部分 */}
      {
        gameStatus > GameStatus.READY
          ? <div relative mx-auto my-8 style={windowStyle()}>
              {
                levelBlocks.map((item, index) => (
                  item.status === BlockStatus.READY && (
                    <div absolute rounded-2 border-teal-4 border-2 p-2px key={index} style={levelBlockStyle(item)}>
                      <img w-full h-full src={item.emoji} alt={`Emoji${index}`} style={levelBlockImageStyle(item)} />
                    </div>
                  )
                ))
              }
             </div>
          : <div>Loading...</div>
      }
    </>
  )
}

export default GamePage
