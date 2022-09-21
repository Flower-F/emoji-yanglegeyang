import useEmoji from '~/hooks/useEmoji'
import type { EmojiType } from '~/types/emoji'

type SvgImageModule = typeof import('*.svg')
type ImportModuleFunction = () => Promise<SvgImageModule>

const tabs: EmojiType[] = ['head', 'eyes', 'eyebrows', 'mouth', 'detail']
const CANVAS_LENGTH = 640

const pathToImage = (path: string) => {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (path === '') {
      resolve(null)
    }

    const img = new Image(400, 400)
    img.src = path
    img.onload = () => {
      resolve(img)
    }
  })
}

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map(importFn => importFn())
  const loadedModules = await Promise.all(imports)
  return loadedModules.map(module => module.default)
}

const EmojiPage = () => {
  const { t } = useTranslation()
  const {
    currentEmoji,
    selectedTab,
    emojiIndex,
    currentImages,
    setCurrentImages,
    selectItem,
    undo,
    getRandom,
    setSelectedTab,
  } = useEmoji()
  const canvas = useRef<HTMLCanvasElement | null>(null)

  const exportImage = useMemoizedFn((blob: Blob | null) => {
    if (!blob) {
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emoji_${Date.now()}`
    a.click()
  })

  const loadImage: () => Promise< { [key in EmojiType]: string[] }> = useMemoizedFn(async () => {
    const headModules = import.meta.glob<SvgImageModule>('~/assets/images/head/*.svg')
    const headImages = await resolveImportGlobModule(headModules)
    const eyesModules = import.meta.glob<SvgImageModule>('~/assets/images/eyes/*.svg')
    const eyesImages = await resolveImportGlobModule(eyesModules)
    const eyebrowsModules = import.meta.glob<SvgImageModule>('~/assets/images/eyebrows/*.svg')
    const eyebrowsImages = await resolveImportGlobModule(eyebrowsModules)
    const mouthModules = import.meta.glob<SvgImageModule>('~/assets/images/mouth/*.svg')
    const mouthImages = await resolveImportGlobModule(mouthModules)
    const detailModules = import.meta.glob<SvgImageModule>('~/assets/images/details/*.svg')
    const detailImages = await resolveImportGlobModule(detailModules)

    return {
      head: headImages,
      eyes: ['', ...eyesImages],
      eyebrows: ['', ...eyebrowsImages],
      mouth: ['', ...mouthImages],
      detail: ['', ...detailImages],
    }
  })

  useEffect(() => {
    loadImage().then((res) => {
      setCurrentImages(res)
      getRandom()
    })
  }, [getRandom, loadImage, setCurrentImages])

  useEffect(() => {
    const { head, eyebrows, eyes, mouth, detail } = currentEmoji

    Promise.all([
      pathToImage(head),
      pathToImage(eyes),
      pathToImage(eyebrows),
      pathToImage(mouth),
      pathToImage(detail),
    ]).then((images) => {
      const ctx = canvas.current?.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.current?.width || 0, canvas.current?.height || 0)
        images.forEach((img) => {
          img && ctx.drawImage(img, 0, 0, CANVAS_LENGTH, CANVAS_LENGTH)
        })
        canvas.current?.classList.add('animate-bounce-in')
        setTimeout(() => {
          canvas.current?.classList.remove('animate-bounce-in')
        }, 500)
      }
    }).catch((e) => {
      console.error('Error:', e)
    })
  }, [currentEmoji])

  return (
    <div
      flex="~ col" items-center justify-center gap-4 w-full h-auto max-w-800px mx-auto py-4
      bg="#f4fef4 dark:#121212" rounded-md shadow-teal shadow-sm
    >
      {/* 展示区域 */}
      <div flex items-center justify-center mt-4 w="200px" h="200px" border="2 neutral-3" rounded-2xl>
        <canvas width="640" height="640" w="160px" h="160px" ref={canvas}></canvas>
      </div>

      {/* 操作区域 */}
      <div flex gap-2 bg="teal-5" px-3 py-2 rounded-full>
        <button rounded-btn w-12 h-12 title={t('emoji.undo')} onClick={undo}>
          <div i-carbon-undo></div>
        </button>
        <button rounded-btn w-12 h-12 title={t('emoji.randomize')} onClick={getRandom}>
          <div i-fad-random-1dice w-6 h-6></div>
        </button>
        <button rounded-btn w-12 h-12 title={t('emoji.download')} onClick={() => canvas.current?.toBlob(exportImage)}>
          <div i-carbon-cloud-download></div>
        </button>
      </div>

      {/* 一级选择区域 */}
      <div
        flex flex-wrap justify-center items-center gap-3 p-4
        border="b neutral-4 op-20" className="w-85%"
      >
        {
          tabs.map((tab, index) => (
            <button
              key={tab + index}
              flex items-center justify-center cursor-pointer transition-colors h-16 w-16 rounded-lg
              border="~ teal-7 dark:teal-2 op-40"
              hover="bg-teal-4 dark:bg-teal-3 border-2 border-op-90"
              onClick={() => setSelectedTab(tab)}
              className={`${tab === selectedTab ? 'bg-teal-3 dark:bg-teal-3' : 'bg-teal-1 dark:bg-#333'}`}
            >
              {currentEmoji[tab] && <img h-12 w-12 rounded-lg src={currentEmoji[tab]} alt={tab} />}
            </button>
          ))
        }
      </div>

      {/* 二级选择区域 */}
      <div p-4 flex items-center justify-center flex-wrap gap-3 className="w-85%">
        {
          (Object.keys(currentImages) as (keyof typeof currentImages)[]).map(tab => (
            selectedTab === tab && currentImages[tab].map((image, index) => (
              <button
                key={tab + index}
                flex items-center justify-center cursor-pointer transition-colors h-12 w-12 rounded-lg
                border="~ teal-7 dark:teal-2 op-40"
                hover="bg-teal-4 dark:bg-teal-3 border-2 border-op-90"
                onClick={() => selectItem({ tab, index })}
                className={`${emojiIndex[selectedTab] === index ? 'bg-teal-3 dark:bg-teal-3' : 'bg-teal-1 dark:bg-#333'}`}
              >
                {image && <img h-10 w-10 rounded-lg src={image} alt={tab + index} />}
              </button>
            ))
          ))
        }
      </div>
    </div>
  )
}

export default EmojiPage
