import type { CSSProperties } from 'react'

import bgm from '~/assets/music/bgm.mp3'
import ComLoading from '~/components/ComLoading'
import { BLOCK_UNIT, BlockStatus, BOARD_UNIT, GameStatus } from '~/constants'
import useGame from '~/hooks/useGame'
import { closeModal, closeMusic, openModal, openMusic, setImages, setModalContent, setMusicSource } from '~/store'
import type { BlockType } from '~/types/block'

type PngImageModule = typeof import('*.png')
type ImportModuleFunction = () => Promise<PngImageModule>

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map(importFn => importFn())
  const loadedModules = await Promise.all(imports)
  return loadedModules.map(module => module.default)
}

const isThursday = new Date().getDay() === 4

/** 每个格子的宽高，单位 px */
const UNIT_SIZE = 14

const GamePage = () => {
  const imageStore = useSelector(store => store.image)
  const musicStore = useSelector(store => store.music)
  const {
    levelBlocks,
    slotBlocks,
    randomBlocks,
    gameStatus,
    totalBlockNum,
    disappearedBlockNum,
    foresee,
    startGame,
    clickBlock,
    shuffleSkill,
    foreseeSkill,
    undoSkill,
    destroySkill,
  } = useGame(imageStore.images)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const responsive = useResponsive()

  const loadImage = useMemoizedFn(async () => {
    let modules
    if (isThursday) {
      modules = import.meta.glob<PngImageModule>('~/assets/images/kfc/*.png')
    } else {
      modules = import.meta.glob<PngImageModule>('~/assets/images/emojis/*.png')
    }
    const images = await resolveImportGlobModule(modules)
    dispatch(setImages(images))
  })

  useEffect(() => {
    loadImage().then(() => {
      startGame()
    })
  }, [loadImage, startGame])

  useEffect(() => {
    if (!musicStore.source) {
      dispatch(setMusicSource(bgm))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicStore.source])

  const levelBlockStyle: (item: BlockType) => CSSProperties = useMemoizedFn((item) => {
    return {
      zIndex: item.level,
      left: `${item.x * UNIT_SIZE}px`,
      top: `${item.y * UNIT_SIZE}px`,
      backgroundColor: item.blocksLowerThan.length > 0 ? '#707c69' : 'rgba(243, 244, 246, var(--un-bg-opacity))',
      cursor: item.blocksLowerThan.length > 0 ? 'not-allowed' : 'pointer',
      width: `${UNIT_SIZE * BLOCK_UNIT}px`,
      height: `${UNIT_SIZE * BLOCK_UNIT}px`,
    }
  })

  const randomBlockStyle: (index: number) => CSSProperties = useMemoizedFn((index) => {
    return {
      cursor: index === 0 || foresee ? 'pointer' : 'not-allowed',
    }
  })

  const levelBlockImageStyle: (item: BlockType) => CSSProperties = useMemoizedFn((item) => {
    return {
      opacity: item.blocksLowerThan.length > 0 ? '0.5' : '1',
    }
  })

  const boardStyle: () => CSSProperties = useMemoizedFn(() => {
    return {
      width: `${UNIT_SIZE * BOARD_UNIT}px`,
      height: `${UNIT_SIZE * BOARD_UNIT}px`,
    }
  })

  const containerStyle: () => CSSProperties = useMemoizedFn(() => {
    return {
      maxWidth: `${UNIT_SIZE * BOARD_UNIT + 25}px`,
    }
  })

  const headerStyle: () => CSSProperties = useMemoizedFn(() => {
    if (!responsive.md) {
      return {
        maxWidth: `${UNIT_SIZE * BOARD_UNIT + 25}px`,
      }
    } else {
      return {
        maxWidth: '580px',
        marginBottom: '36px',
      }
    }
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
    if (!musicStore.isPlaying) {
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
        <button className="btn" p-2 rounded-full onClick={toggleMusic} title={musicStore.isPlaying ? t('game.musicOpen') : t('game.musicClose')}>
          {musicStore.isPlaying ? <div i-carbon-music w-6 h-6></div> : <div i-carbon-music-remove w-6 h-6></div>}
        </button>
      </div>,
    ))
    dispatch(openModal())
  })

  return (
    <>
      {/* 头部 */}
      <div flex justify-between items-center mx-auto mb-2 style={headerStyle()}>
        {/* 分数 */}
        <div className="btn" cursor-none select-none>{disappearedBlockNum} / {totalBlockNum}</div>
        {/* 设置 */}
        <button flex gap-2 text-gray100 bg-teal-6 p="x2 y1.5" rounded className="btn" title={t('game.settings')} onClick={showSettingsModal}>
          <div i-carbon-settings w-6 h-6></div>
        </button>
      </div>
      {/* 分层区和随机区域 */}
      <div mx-auto flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 style={containerStyle()}>
        {
          gameStatus > GameStatus.READY && imageStore.images.length > 0
            ? (
                <div border-teal-5 border-4 px-10px py-4 rounded-4 bg-teal-1>
                  {/* 分层部分 */}
                  <div relative style={boardStyle()}>
                    {
                      levelBlocks.map((item, index) => (
                        item.status === BlockStatus.READY && (
                          <button absolute flex justify-center items-center rounded-2 border-teal-4 border-2 key={index} style={levelBlockStyle(item)} onClick={() => clickBlock(item)}>
                            <img w-full h-full rounded-2 src={item.emoji} alt={`Layer emoji${index}`} style={levelBlockImageStyle(item)} />
                          </button>
                        )
                      ))
                    }
                  </div>
                  {/* 随机部分 */}
                  <div mt-2 flex gap-3 flex-col mx-auto pt-2 max-w-258px>
                    {
                      randomBlocks.map((randomBlock, outIndex) => (
                        randomBlock.length > 0 && (
                          <div key={outIndex} flex flex-wrap justify-center items-center gap-2 bg-teal-3 p-2 mx-auto rounded-2>
                            {
                              randomBlock.map((item, index) => (
                                <button key={index} rounded-2 flex justify-center items-center bg-gray100 w-42px h-42px onClick={() => clickBlock(item, outIndex, index)} style={randomBlockStyle(index)}>
                                  {
                                    index === 0 || foresee
                                      ? <img src={item.emoji} w-full h-full rounded-2 alt={`Random emoji${index}`} />
                                      : <div w-full h-full flex items-center justify-center rounded-2 bg-gray100 text="teal-9 xl" font-extrabold>?</div>
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
        {/* 槽区与技能区 */}
        {
          gameStatus > GameStatus.READY
            ? (
                <div flex md:flex-col gap-2 md:gap-4 bg-teal-1 p-4 rounded-4 border-teal-5 border-4>
                  {/* 槽区 */}
                  <div flex flex-wrap gap-2 justify-center items-center>
                    {
                      slotBlocks.map((item, index) => (
                        <div key={index}>
                          {
                            <div w-10 h-10 bg-gray100 rounded-2 border-teal-4 border-2>
                              {item ? <img src={item.emoji} w-full h-full rounded-2 alt={`Emoji${index}`} /> : null}
                            </div>
                          }
                        </div>
                      ))
                    }
                  </div>
                  {/* 技能区 */}
                  <div flex flex-col gap-2 justify-center items-center text-teal-7>
                    <button w-100px font-bold rounded-2 py-1 border-teal-5 border-2 onClick={shuffleSkill}>{t('game.shuffle')}</button>
                    <button w-100px font-bold rounded-2 py-1 border-teal-5 border-2 onClick={undoSkill}>{t('game.undo')}</button>
                    <button w-100px font-bold rounded-2 py-1 border-teal-5 border-2 onClick={foreseeSkill}>{t('game.foresee')}</button>
                    <button w-100px font-bold rounded-2 py-1 border-teal-5 border-2 onClick={destroySkill}>{t('game.destroy')}</button>
                  </div>
                </div>
              )
            : null
        }
      </div>
    </>
  )
}

export default GamePage
