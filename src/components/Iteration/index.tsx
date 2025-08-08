import { useState } from 'react'
import { type Iteration } from '../../types'
import TransparentButton from '../buttons/transparent'
import OutlinedButton from '../buttons/outlined'
import { useExperimentsContext } from '../../context'

interface IterationProps {
  iteration: Iteration
  onlyOne: boolean
  first: boolean
  last: boolean
}

export default function Iteration(props: IterationProps) {
  const { iteration, onlyOne, first, last } = props
  const { id, title, experimentId, state, length } = iteration
  const { handleIterationLengthUpdate, handleRemoveIteration } =
    useExperimentsContext()

  const [isOpen, setIsOpen] = useState(false)
  const [currentLength, setCurrentLength] = useState(length)

  const handDoneClick = () => {
    handleIterationLengthUpdate(experimentId, id, currentLength)
    setIsOpen(false)
  }

  const handRemoveClick = () => {
    handleRemoveIteration(experimentId, id)
    setIsOpen(false)
  }

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

      <div className="flex-1 flex flex-col gap-4">
        <p
          className={`text-xl cursor-pointer ${
            state === 'pending' ? 'text-white/50' : 'text-white/70'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {title}
        </p>

        {isOpen && (
          <>
            <div
              className="flex justify-start gap-4 flex-wrap pb-4
                border-b-2 border-white/10"
            >
              <OutlinedButton
                onClick={() => setCurrentLength('short')}
                isActive={currentLength === 'short'}
              >
                short
              </OutlinedButton>
              <OutlinedButton
                onClick={() => setCurrentLength('medium')}
                isActive={currentLength === 'medium'}
              >
                medium length
              </OutlinedButton>
              <OutlinedButton
                onClick={() => setCurrentLength('long')}
                isActive={currentLength === 'long'}
              >
                very very very long (up to 35 char)
              </OutlinedButton>
            </div>

            <div className="flex justify-end gap-10 mr-4">
              <TransparentButton onClick={handRemoveClick}>
                remove
              </TransparentButton>
              <TransparentButton onClick={handDoneClick}>
                done
              </TransparentButton>
            </div>
          </>
        )}
      </div>

      {state === 'done' && !isOpen && (
        <div className="flex items-center gap-2">
          <p className="text-white/50 text-xl">Selection</p>
          <span className="bg-green-500 w-2 h-2 rounded-full" />
        </div>
      )}
    </div>
  )
}
