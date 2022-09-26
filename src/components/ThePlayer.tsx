import { maintainMusicSource } from '~/store'

const ThePlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlaying = useSelector(store => store.music.isPlaying)
  const reset = useSelector(store => store.music.reset)
  const source = useSelector(store => store.music.source)
  const dispatch = useDispatch()

  useUpdateEffect(() => {
    if (!audioRef.current) {
      return
    }
    if (reset) {
      audioRef.current.src = source
    }
    if (isPlaying && audioRef.current.src !== '') {
      audioRef.current.play()
      dispatch(maintainMusicSource())
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, reset, source])

  return (
    <audio ref={audioRef} loop={true}>
      <track kind="captions" />
    </audio>
  )
}

export default ThePlayer
