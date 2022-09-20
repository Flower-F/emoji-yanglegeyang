const ThePlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { isPlaying, source } = useSelector(store => store.music)
  const dispatch = useDispatch()

  useUpdateEffect(() => {
    if (!audioRef.current) {
      return
    }
    if (isPlaying && source !== '') {
      audioRef.current.src = source
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [dispatch, isPlaying, source])

  return (
    <audio ref={audioRef} loop={true}>
      <track kind="captions" />
    </audio>
  )
}

export default ThePlayer
