const IndexPage = () => {
  const { t } = useTranslation()

  return (
    <div flex flex-col justify-center items-center h-80vh px-12>
      <div w-full max-w-300px flex flex-col gap-3 items-center border-teal border-4 py-12 rounded>
        <h2 text-2xl mb-5 text-teal-7 dark:text-teal-2 font-bold className="w-90%">{t('index.title')}</h2>
        <button className="btn" text-xl>{t('index.easy')}</button>
        <button className="btn" text-xl>{t('index.medium')}</button>
        <button className="btn" text-xl>{t('index.difficult')}</button>
        <button className="btn" text-xl>{t('index.hell')}</button>
      </div>
    </div>
  )
}

export default IndexPage
