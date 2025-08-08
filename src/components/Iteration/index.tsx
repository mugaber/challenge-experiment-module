import { type Iteration } from '../../types'

interface IterationProps {
  iteration: Iteration
  onlyOne: boolean
  first: boolean
  last: boolean
}

export default function Iteration(props: IterationProps) {
  const { iteration, onlyOne, first, last } = props
  const { id, title, state } = iteration

  return (
    <div
      key={id}
      className={`w-full flex p-3 bg-black ${
        onlyOne
          ? 'rounded-lg'
          : first
          ? 'rounded-t-lg'
          : last
          ? 'rounded-b-lg'
          : ''
      }`}
    >
      <p className="w-2/12 text-white/50 text-xl">EM-{id}</p>
      <p
        className={`flex-1 text-xl ${
          state === 'pending' ? 'text-white/50' : 'text-white/70'
        }`}
      >
        {title}
      </p>

      {state === 'done' && (
        <div className="flex items-center gap-2">
          <p className="text-white/50 text-xl">Selection</p>
          <span className="bg-green-500 w-2 h-2 rounded-full" />
        </div>
      )}
    </div>
  )
}
