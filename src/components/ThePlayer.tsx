import { maintainMusicSource } from '~/store'

const ThePlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const musicStore = useSelector(store => store.music)
  const dispatch = useDispatch()

  useUpdateEffect(() => {
    if (!audioRef.current) {
      return
    }
    if (musicStore.reset) {
      audioRef.current.src = musicStore.source
    }
    if (musicStore.isPlaying && audioRef.current.src !== '') {
      audioRef.current.play()
      dispatch(maintainMusicSource())
    } else {
      audioRef.current.pause()
    }
  }, [musicStore.isPlaying, musicStore.reset, musicStore.source])

  return (
    <audio ref={audioRef} loop={true}>
      <track kind="captions" />
    </audio>
  )
}

export default ThePlayer
