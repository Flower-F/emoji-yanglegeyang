import { easyGameConfig } from '~/configs'

const GamePage = () => {
  const { images } = useSelector(store => store.persist.image)
  const { startGame } = useGame(easyGameConfig, images)

  useEffect(() => {
    startGame()
  }, [startGame])

  // const handleClick = () => {
  //   console.log('levelBlocks', levelBlocks.current)
  //   console.log('slotBlocks', slotBlocks.current)
  //   console.log('randomBlocks', randomBlocks.current)
  // }

  return (
    <div>
      {
        images.map((image, index) =>
          <img w-10 h-10 src={image} alt={image} key={index} />,
        )
      }
    </div>
  )
}

export default GamePage
