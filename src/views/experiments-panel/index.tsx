import { useState } from 'react'
import ExperimentModule from '../../components/experiment-module'
import { initialExperiments } from '../../data'
import {
  ExperimentStatuses,
  type Iteration,
  type IterationState
} from '../../types'

export default function ExperimentsPanel() {
  const [experiments, setExperiments] = useState(initialExperiments)
  const [activeIteration, setActiveIteration] = useState<{
    iterationId: number
    experimentId: number
  } | null>(null)

  const handleAddIteration = (experimentId: number) => {
    setExperiments((prevExperiments) => {
      const updatedExperiments = prevExperiments.map((experiment) => {
        if (experiment.id !== experimentId) return experiment

        const updateStatus = experiment.status === ExperimentStatuses.EMPTY

        const iterationId = experiment.iterations.length + 1
        setActiveIteration({ iterationId, experimentId })

        return {
          ...experiment,
          ...(updateStatus && { status: ExperimentStatuses.UNLOCKED }),
          iterations: [
            ...experiment.iterations,
            {
              id: iterationId,
              title: 'Adding iteration...',
              experimentId,
              state: 'pending' as IterationState
            }
          ]
        }
      })

      return updatedExperiments
    })
  }

  const handleIterationUpdate = (operation: 'done' | 'cancel') => {
    setExperiments((prevExperiments) => {
      const updatedExperiments = prevExperiments.map((experiment) => {
        if (experiment.id !== activeIteration?.experimentId) return experiment

        const updatedIterations = experiment.iterations
          .map((iteration) => {
            if (iteration.id !== activeIteration?.iterationId) return iteration

            if (operation === 'cancel') return undefined

            return {
              ...iteration,
              title: 'Iteration title',
              state: 'done' as IterationState
            }
          })
          .filter(Boolean)

        const updateStatus = updatedIterations.length === 0

        return {
          ...experiment,
          ...(updateStatus && { status: ExperimentStatuses.EMPTY }),
          iterations: updatedIterations as Iteration[]
        }
      })

      return updatedExperiments
    })
  }

  const handleResetExperiment = (experimentId: number) => {
    setExperiments((prevExperiments) => {
      const updatedExperiments = prevExperiments.map((experiment) => {
        if (experiment.id !== experimentId) return experiment

        return {
          ...experiment,
          status: ExperimentStatuses.EMPTY,
          iterations: []
        }
      })

      return updatedExperiments
    })
  }

  return (
    <div className="w-screen h-screen overflow-y-auto">
      <div
        className="min-h-full flex flex-col items-center justify-center 
          gap-4 py-4"
      >
        {experiments.map((experiment) => (
          <ExperimentModule
            key={experiment.id}
            experiment={experiment}
            onAddIteration={handleAddIteration}
            onResetExperiment={handleResetExperiment}
            onIterationUpdate={handleIterationUpdate}
          />
        ))}
      </div>
    </div>
  )
}
