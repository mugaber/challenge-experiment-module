import { useState, type ReactNode } from 'react'
import { initialExperiments } from '../data'
import {
  ExperimentStatuses,
  type IterationState,
  type Iteration,
  type IterationLength
} from '../types'
import { ExperimentsContext, type ExperimentsContextType } from './index'

interface ExperimentsProviderProps {
  children: ReactNode
}

export default function ExperimentsProvider({
  children
}: ExperimentsProviderProps) {
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
              state: 'pending' as IterationState,
              length: 'short' as IterationLength
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
    setActiveIteration(null)
  }

  const handleIterationLengthUpdate = (
    experimentId: number,
    iterationId: number,
    length: IterationLength
  ) => {
    setExperiments((prevExperiments) => {
      const updatedExperiments = prevExperiments.map((experiment) => {
        if (experiment.id !== experimentId) return experiment

        const updatedIterations = experiment.iterations.map((iteration) => {
          if (iteration.id !== iterationId) return iteration

          return { ...iteration, length }
        })

        return { ...experiment, iterations: updatedIterations }
      })

      return updatedExperiments
    })
  }

  const handleRemoveIteration = (experimentId: number, iterationId: number) => {
    setExperiments((prevExperiments) => {
      const updatedExperiments = prevExperiments.map((experiment) => {
        if (experiment.id !== experimentId) return experiment

        const updatedIterations = experiment.iterations.filter(
          (iteration) => iteration.id !== iterationId
        )

        updatedIterations.forEach((iteration, index) => {
          iteration.id = index + 1
        })

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

  const handleLockStatus = (experimentId: number) => {
    setExperiments((prevExperiments) => {
      const updatedExperiments = prevExperiments.map((experiment) => {
        if (experiment.id !== experimentId) return experiment

        return {
          ...experiment,
          status:
            experiment.status === ExperimentStatuses.LOCKED
              ? ExperimentStatuses.UNLOCKED
              : ExperimentStatuses.LOCKED
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
    setActiveIteration(null)
  }

  const value: ExperimentsContextType = {
    experiments,
    activeIteration,
    handleAddIteration,
    handleIterationUpdate,
    handleIterationLengthUpdate,
    handleRemoveIteration,
    handleLockStatus,
    handleResetExperiment
  }

  return (
    <ExperimentsContext.Provider value={value}>
      {children}
    </ExperimentsContext.Provider>
  )
}
