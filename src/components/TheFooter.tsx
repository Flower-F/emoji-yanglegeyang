const TheFooter = () => {
  const { t } = useTranslation()

  return (
    <footer text="base neutral-6 dark:neutral-4" p-6>
      <div>
        {t('footer.assets')} {' '}
        <a dashed-link href="https://emoji-generator.netlify.app/" target="_blank" rel="noreferrer">{t('footer.generator')}</a>
      </div>
      <div>
        {t('footer.inspiration')}
        {' '} <a dashed-link href="https://github.com/ddiu8081" target="_blank" rel="noreferrer">Diu</a> &
        {' '} <a dashed-link href="https://github.com/liyupi" target="_blank" rel="noreferrer">YuPi</a>
      </div>
      <div>
        Made by
        {' '} <a dashed-link href="https://github.com/Flower-F" target="_blank" rel="noreferrer">Flower-F</a> {' '} |
        {' '} <a dashed-link href="https://github.com/Flower-F/emoji-yanglegeyang" target="_blank" rel="noreferrer">Source Code</a>
      </div>
    </footer>
  )
}

export default TheFooter
