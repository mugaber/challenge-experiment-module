import { useEffect, useState } from 'react'
import { useExperimentsContext } from '../../context'
import lockOpenIcon from '../../assets/lock-open.svg'
import lockClosedIcon from '../../assets/lock-closed.svg'
import { ExperimentStatuses, type Experiment } from '../../types'
import Iteration from '../Iteration'
import TransparentButton from '../buttons/transparent'

interface ExperimentModuleProps {
  experiment: Experiment
}

export default function ExperimentModule(props: ExperimentModuleProps) {
  const { experiment } = props
  const {
    handleAddIteration,
    handleResetExperiment,
    handleIterationUpdate,
    handleLockStatus
  } = useExperimentsContext()
  const { id: experimentId, status, title, iterations } = experiment

  const isEmpty = status === ExperimentStatuses.EMPTY
  const isLocked = status === ExperimentStatuses.LOCKED
  const isUnlocked = status === ExperimentStatuses.UNLOCKED

  const hasIterations = iterations.length > 0

  const [isModuleOpen, setIsModuleOpen] = useState(false)
  const [isAddingIteration, setIsAddingIteration] = useState(false)

  useEffect(() => {
    if (isLocked) setIsModuleOpen(false)
  }, [isLocked])

  const handleAddIterationClick = (experimentId: number) => {
    setIsAddingIteration(true)
    handleAddIteration(experimentId)
  }

  const handleIterationUpdateClick = (operation: 'done' | 'cancel') => {
    setIsAddingIteration(false)
    handleIterationUpdate(operation)
  }

  const handleModuleOpen = () => {
    if (isLocked) return
    setIsModuleOpen(!isModuleOpen)
  }

  const handleLockStatusClick = () => {
    if (isLocked) setIsModuleOpen(true)
    handleLockStatus(experimentId)
  }

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-6 gap-4
        bg-[#242424] rounded-lg w-11/12 sm:w-8/12 lg:w-6/12 max-w-[500px]"
    >
      <div className="w-full flex justify-between items-center">
        <h3
          className={`flex-1 text-2xl font-bold ${
            isUnlocked ? 'text-white' : 'text-white/50'
          } ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={handleModuleOpen}
        >
          {title}
        </h3>

        {!isEmpty && (
          <img
            src={isLocked ? lockClosedIcon : lockOpenIcon}
            alt="Lock Icon"
            className="w-6 h-6 mr-4 cursor-pointer"
            onClick={handleLockStatusClick}
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
                  onClick={() => handleIterationUpdateClick('cancel')}
                >
                  cancel
                </TransparentButton>

                <TransparentButton
                  onClick={() => handleIterationUpdateClick('done')}
                >
                  done
                </TransparentButton>
              </>
            )}

            {!isAddingIteration && (
              <>
                {hasIterations && (
                  <TransparentButton
                    onClick={() => handleResetExperiment(experimentId)}
                  >
                    reset
                  </TransparentButton>
                )}

                <TransparentButton
                  onClick={() => handleAddIterationClick(experimentId)}
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
