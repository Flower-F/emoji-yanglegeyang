import { Link } from 'react-router-dom'

import { GameDifficulty, getGameConfig } from '~/constants'
import { setGameConfig } from '~/store'

const IndexPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const goToGamePage = useMemoizedFn((difficulty: GameDifficulty) => {
    dispatch(setGameConfig(getGameConfig(difficulty)))
    navigate('/game')
  })

  return (
    <div flex flex-col justify-center items-center min-h-70vh px-6>
      <div w-full max-w-260px flex flex-col gap-3 items-center border-teal border-4 py-10 rounded>
        <h2 text-2xl mb-4 text-teal-7 dark:text-teal-2 font-bold className="w-90%">{t('index.title')}</h2>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.EASY)}>{t('index.easy')}</button>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.MEDIUM)}>{t('index.medium')}</button>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.HARD)}>{t('index.difficult')}</button>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.HELL)}>{t('index.hell')}</button>
        <button className="btn max-w-80%" text-xl onClick={() => goToGamePage(GameDifficulty.YANG_LE_GE_YANG)}>{t('index.yanglegeyang')}</button>
        <Link className="btn max-w-80%" text-xl to="custom">{t('index.custom')}</Link>
        <Link dashed-link text-teal-8 dark:text-teal-5 max-w-200px mt-4 to="emoji">{t('index.emoji')}</Link>
      </div>
    </div>
  )
}

export default IndexPage
