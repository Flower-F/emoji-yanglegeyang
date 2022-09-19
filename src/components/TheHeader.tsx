import i18n, { resources } from '~/i18n'

const TheHeader = () => {
  const { toggleDark } = useDark()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [language, setLanguage] = useLocalStorageState(
    'lang',
    {
      defaultValue: Number(localStorage.getItem('lang')) ?? 0,
    },
  )

  const toggleLocales = () => {
    const locales = Object.keys(resources)
    setLanguage((language + 1) % locales.length)
    i18n.changeLanguage(locales[(language + 1) % locales.length])
  }

  return (
    <header flex justify-between items-center mb-2 pb-4 text="xl black dark:neutral-2">
      <h1>
        <button flex items-center gap-2 text-lg font-extrabold tracking-wide onClick={() => navigate('/')}>
          <img src="/favicon.svg" alt="logo" w-6 h-6 pb-1px />
          {t('title')}
        </button>
      </h1>

      <nav text-xl inline-flex items-center gap-3>
        <button icon-btn onClick={toggleLocales} title={t('header.lang')}>
          <div i-carbon-language />
        </button>

        <button icon-btn onClick={toggleDark} title={t('header.mode')}>
          <div dark:i-carbon-moon i-carbon-sun />
        </button>

        <a
          icon-btn i-carbon-logo-github
          rel="noreferrer"
          href="https://github.com/Flower-F/emoji-yanglegeyang"
          target="_blank"
          title={t('header.github')}
        >
          Github Link
        </a>
      </nav>
    </header>
  )
}

export default TheHeader
