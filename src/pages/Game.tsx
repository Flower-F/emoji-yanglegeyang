import type { CSSProperties } from 'react'

import bgm from '~/assets/music/bgm.mp3'
import ComLoading from '~/components/ComLoading'
import { BLOCK_UNIT, BlockStatus, BOARD_UNIT, GameStatus } from '~/constants'
import useGame from '~/hooks/useGame'
import { closeModal, closeMusic, openModal, openMusic, setImages, setModalContent, setMusicSource } from '~/store'
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
  const { isPlaying } = useSelector(store => store.music)
  const {
    levelBlocks,
    slotBlocks,
    randomBlocks,
    gameStatus,
    totalBlockNum,
    disappearedBlockNum,
    startGame,
    clickBlock,
  } = useGame(images)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const loadImage = useMemoizedFn(async () => {
    const modules = import.meta.glob<ImageModule>('~/assets/images/*.png')
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
      zIndex: item.level,
      left: `${item.x * UNIT_SIZE}px`,
      top: `${item.y * UNIT_SIZE}px`,
      backgroundColor: item.blocksLowerThan.length > 0 ? '#707c69' : '#fff',
      cursor: item.blocksLowerThan.length > 0 ? 'not-allowed' : 'pointer',
      width: `${UNIT_SIZE * BLOCK_UNIT}px`,
      height: `${UNIT_SIZE * BLOCK_UNIT}px`,
    } as CSSProperties
  })

  const randomBlockStyle = useMemoizedFn((index: number) => {
    return {
      cursor: index === 0 ? 'pointer' : 'not-allowed',
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

  const goBackHome = useMemoizedFn(() => {
    dispatch(closeModal())
    navigate('/')
  })

  const replayGame = useMemoizedFn(() => {
    dispatch(closeModal())
    startGame()
  })

  const toggleMusic = useMemoizedFn(() => {
    if (!isPlaying) {
      dispatch(setMusicSource(bgm))
      dispatch(openMusic())
    } else {
      dispatch(closeMusic())
    }
    dispatch(closeModal())
  })

  const showSettingsModal = useMemoizedFn(() => {
    dispatch(setModalContent(
      <div flex justify-between p-20px mt-4 mx-auto max-w-220px>
        <button className="btn" p-2 rounded-full onClick={replayGame} title={t('game.restart')}>
          <div i-carbon-reset w-6 h-6></div>
        </button>
        <button className="btn" p-2 rounded-full onClick={goBackHome} title={t('game.home')}>
          <div i-carbon-home w-6 h-6></div>
        </button>
        <button className="btn" p-2 rounded-full onClick={toggleMusic} title={isPlaying ? t('game.musicOpen') : t('game.musicClose')}>
          {isPlaying ? <div i-carbon-music w-6 h-6></div> : <div i-carbon-music-remove w-6 h-6></div>}
        </button>
      </div>,
    ))
    dispatch(openModal())
  })

  return (
    <div mx-auto flex flex-col justify-center items-center gap-4 style={containerStyle()}>
      {/* 分数部分 */}
      <div flex justify-between items-center w-full>
      <div className="btn" cursor-none select-none>{disappearedBlockNum} / {totalBlockNum}</div>
        <button flex gap-2 text-white bg-teal-6 p="x2 y1.5" rounded className="btn" title={t('game.settings')} onClick={showSettingsModal}>
          <div i-carbon-settings w-6 h-6></div>
        </button>
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
                        <div key={outIndex} flex flex-wrap justify-center items-center gap-2 bg-teal-4 p="x-6px y-10px" mx-auto rounded-2>
                          {
                            randomBlock.map((item, index) => (
                              <button key={index} rounded-2 bg-white w-36px h-36px onClick={() => clickBlock(item, outIndex, index)} style={randomBlockStyle(index)}>
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
          : <ComLoading />
      }
      {/* 槽 */}
      <div flex bg-teal-1 p-4 rounded-4 border-teal-5 border-4>
        <div flex flex-wrap gap-2 justify-center items-center>
          {
            slotBlocks.map((item, index) => (
              <div key={index}>
                {
                  <div w-10 h-10 bg-white rounded-2 p-1px border-teal-4 border-2>
                    {item ? <img src={item.emoji} w-full h-full rounded-2 alt={`Emoji${index}`} /> : null}
                  </div>
                }
              </div>
            ))
          }
        </div>
        <div w-150px ml-3 flex flex-col gap-2 justify-center items-center text-teal-9>
          <button w-full rounded-2 p-1px border-teal-4 border-2>{t('game.shuffle')}</button>
          <button w-full rounded-2 p-1px border-teal-4 border-2>{t('game.undo')}</button>
          <button w-full rounded-2 p-1px border-teal-4 border-2>{t('game.foresee')}</button>
          <button w-full rounded-2 p-1px border-teal-4 border-2>{t('game.destroy')}</button>
        </div>
      </div>
    </div>
  )
}

export default GamePage
