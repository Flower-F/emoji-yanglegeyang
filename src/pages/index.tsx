import { getGameConfig } from '~/configs'
import { GameDifficulty } from '~/constants'
import { setGameConfig, setImages } from '~/store'

type ImageModule = typeof import('*.png')
type ImportModuleFunction = () => Promise<ImageModule>

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map(importFn => importFn())
  const loadedModules = await Promise.all(imports)
  return loadedModules.map(module => module.default)
}

const IndexPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const goToGamePage = useMemoizedFn((difficulty: GameDifficulty) => {
    dispatch(setGameConfig(getGameConfig(difficulty)))
    navigate('/game')
  })

  const goToCustomPage = useMemoizedFn(() => {
    navigate('/custom')
  })

  const loadImage = useMemoizedFn(async () => {
    const modules = import.meta.glob<ImageModule>('~/assets/*.png')
    const images = await resolveImportGlobModule(modules)
    dispatch(setImages(images))
  })

  useEffect(() => {
    loadImage()
  }, [loadImage])

  return (
    <div flex flex-col justify-center items-center h-70vh px-6>
      <div w-full max-w-260px flex flex-col gap-3 items-center border-teal border-4 py-10 rounded>
        <h2 text-2xl mb-4 text-teal-7 dark:text-teal-2 font-bold className="w-90%">{t('index.title')}</h2>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.EASY)}>{t('index.easy')}</button>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.MEDIUM)}>{t('index.medium')}</button>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.HARD)}>{t('index.difficult')}</button>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.HELL)}>{t('index.hell')}</button>
        <button className="btn max-w-80%" text-xl onClick={goToCustomPage}>{t('index.custom')}</button>
      </div>
    </div>
  )
}

export default IndexPage
