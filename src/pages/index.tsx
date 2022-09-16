type ImageModule = typeof import('*.png')
type ImportModuleFunction = () => Promise<ImageModule>

const resolveImportGlobModule = async (modules: Record<string, ImportModuleFunction>) => {
  const imports = Object.values(modules).map(importFn => importFn())
  const loadedModules = await Promise.all(imports)
  return loadedModules.map(module => module.default)
}

const IndexPage = () => {
  const [images, setImages] = useState<string[]>([])

  const loadImage = useCallback(async () => {
    const modules = import.meta.glob<ImageModule>('~/assets/*.png')
    const images = await resolveImportGlobModule(modules)
    setImages(images)
  }, [])

  useEffect(() => {
    loadImage()
  }, [loadImage])

  return (
    <div>
      {
        images.map((image, index) =>
          <img src={image} alt={image} key={index} />,
        )
      }
    </div>
  )
}

export default IndexPage
