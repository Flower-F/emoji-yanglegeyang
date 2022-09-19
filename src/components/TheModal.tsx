import ReactModal from 'react-modal'

import { closeModal } from '~/store'

const modalStyles: ReactModal.Styles = {
  content: {
    width: '80%',
    overflowX: 'hidden',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderRadius: '1rem',
    padding: '18px 20px',
  },
  overlay: {
    background: 'rgba(0, 0, 0, 0.72)',
  },
}

const TheModal = () => {
  const { content, isOpen } = useSelector(store => store.modal)
  const dispatch = useDispatch()

  const close = useMemoizedFn(() => {
    dispatch(closeModal())
  })

  return (
    <ReactModal isOpen={isOpen}
      style={modalStyles}
      closeTimeoutMS={80}
      shouldCloseOnOverlayClick={true}
      onRequestClose={close}
    >
      <div>
        <div text-end border-b mb-2>
          <button text="black 3xl hover:teal-7" font-extrabold i-carbon-close onClick={close}></button>
        </div>
        {content}
      </div>
    </ReactModal>
  )
}

export default TheModal