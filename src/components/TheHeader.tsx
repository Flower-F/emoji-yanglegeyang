import { Link } from 'react-router-dom'

import i18n, { resources } from '~/i18n'

const isThursday = new Date().getDay() === 4

const TheHeader = () => {
  const { toggleDark } = useDark()
  const { t } = useTranslation()

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
        <Link flex items-center gap-2 text-lg font-extrabold tracking-wide to="/">
          <img src={isThursday ? '/favicon-kfc.png' : '/favicon.svg'} alt="logo" w-6 h-6 pb-1px />
          {isThursday ? t('header.kfc') : t('header.title')}
        </Link>
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
