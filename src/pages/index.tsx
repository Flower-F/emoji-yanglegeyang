const IndexPage = () => {
  const { t } = useTranslation()

  return (
    <div flex flex-col justify-center items-center h-70vh>
      <h2 text-2xl mb-5 text-teal-8 dark:text-teal-2 font-bold>{t('index.title')}</h2>
      <div flex flex-col gap-3 items-center border-teal border-4 p-6 rounded>
        <button className="btn" max-w-300px text-xl>{t('index.easy')}</button>
        <button className="btn" max-w-300px text-xl>{t('index.medium')}</button>
        <button className="btn" max-w-300px text-xl>{t('index.difficult')}</button>
        <button className="btn" max-w-300px text-xl>{t('index.hell')}</button>
      </div>
    </div>
  )
}

export default IndexPage
