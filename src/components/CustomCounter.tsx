interface CustomCounterProps {
  initialCount: number
  title: string
}

interface CustomCounterRef {
  getCount: () => number
}

const CustomCounter = forwardRef<CustomCounterRef, CustomCounterProps>(({ initialCount, title }, ref) => {
  const [count, { inc, dec }] = useCounter(initialCount)

  useImperativeHandle(ref, () => ({
    getCount() {
      return count
    },
  }))

  return (
    <div flex gap-6 items-center border-b border-b-teal-5 border-dashed pb-2>
      <div w-130px flex justify-between items-center>
        <span rounded>{title}</span>
        <span ml-4>{count}</span>
      </div>
      <button number-btn hover:bg-teal-7 hover:text-teal-2 onClick={() => inc()}>
        <div i-carbon-add></div>
      </button>
      <button number-btn hover:bg-teal-7 hover:text-teal-2 onClick={() => dec()}>
          <div i-carbon-subtract></div>
      </button>
    </div>
  )
})

export default CustomCounter
