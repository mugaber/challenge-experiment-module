import { useState } from 'react'
import lockOpenIcon from '../../assets/lock-open.svg'
import lockClosedIcon from '../../assets/lock-closed.svg'
import { ExperimentStatuses, type Experiment } from '../../types'
import Iteration from '../Iteration'
import TransparentButton from '../buttons'

interface ExperimentModuleProps {
  experiment: Experiment
  onAddIteration: (experimentId: number) => void
  onResetExperiment: (experimentId: number) => void
  onIterationUpdate: (operation: 'done' | 'cancel') => void
}

export default function ExperimentModule(props: ExperimentModuleProps) {
  const { experiment, onAddIteration, onResetExperiment, onIterationUpdate } =
    props
  const { id: experimentId, status, title, iterations } = experiment

  const isEmpty = status === ExperimentStatuses.EMPTY
  const isLocked = status === ExperimentStatuses.LOCKED
  const isUnlocked = status === ExperimentStatuses.UNLOCKED

  const hasIterations = iterations.length > 0

  const [isModuleOpen, setIsModuleOpen] = useState(false)
  const [isAddingIteration, setIsAddingIteration] = useState(false)

  const handleAddIteration = (experimentId: number) => {
    setIsAddingIteration(true)
    onAddIteration(experimentId)
  }

  const handleIterationUpdate = (operation: 'done' | 'cancel') => {
    setIsAddingIteration(false)
    onIterationUpdate(operation)
  }

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-6 gap-4
        bg-[#242424] rounded-lg w-11/12 sm:w-8/12 lg:w-6/12 2xl:w-4/12"
    >
      <div className="w-full flex justify-between items-center">
        <h3
          className={`flex-1 text-2xl font-bold cursor-pointer ${
            isUnlocked ? 'text-white' : 'text-white/50'
          }`}
          onClick={() => setIsModuleOpen(!isModuleOpen)}
        >
          {title}
        </h3>

        {!isEmpty && (
          <img
            src={isLocked ? lockClosedIcon : lockOpenIcon}
            alt="Lock Icon"
            className="w-6 h-6 mr-4"
          />
        )}
      </div>

      {isModuleOpen && (
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          {hasIterations && (
            <div className="w-full flex flex-col gap-0.5">
              {iterations.map((iteration) => {
                const onlyOne = iterations.length === 1
                const isFirst = iteration.id === 1
                const isLast = iteration.id === iterations.length

                return (
                  <Iteration
                    key={iteration.id}
                    iteration={iteration}
                    onlyOne={onlyOne}
                    first={isFirst}
                    last={isLast}
                  />
                )
              })}
            </div>
          )}

          {(isEmpty || isAddingIteration) && (
            <div className="w-full p-4 bg-black rounded-lg">
              <p className="text-white/50 text-xl">
                To add a new iteration, start typing a prompt or{' '}
                <span className="underline">generate</span> one.
              </p>
            </div>
          )}

          <div className="w-full px-4 flex justify-end items-center gap-10">
            {isAddingIteration && (
              <>
                <TransparentButton
                  onClick={() => handleIterationUpdate('cancel')}
                >
                  cancel
                </TransparentButton>

                <TransparentButton
                  onClick={() => handleIterationUpdate('done')}
                >
                  done
                </TransparentButton>
              </>
            )}

            {!isAddingIteration && (
              <>
                {hasIterations && (
                  <TransparentButton
                    onClick={() => onResetExperiment(experimentId)}
                  >
                    reset
                  </TransparentButton>
                )}

                <TransparentButton
                  onClick={() => handleAddIteration(experimentId)}
                >
                  <span>+</span> add iteration
                </TransparentButton>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
