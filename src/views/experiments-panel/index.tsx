import { useState } from 'react'
import ExperimentModule from '../../components/experiment-module'
import { initialExperiments } from '../../data'
import { ExperimentStatuses } from '../../types'

export default function ExperimentsPanel() {
  const [experiments, setExperiments] = useState(initialExperiments)

  const handleAddIteration = (experimentId: number) => {
    setExperiments((prevExperiments) => {
      const updatedExperiments = prevExperiments.map((experiment) => {
        if (experiment.id !== experimentId) return experiment

        const updateStatus = experiment.status === ExperimentStatuses.EMPTY

        return {
          ...experiment,
          ...(updateStatus && { status: ExperimentStatuses.UNLOCKED }),
          iterations: [
            ...experiment.iterations,
            {
              id: experiment.iterations.length + 1,
              title: 'Iteration title',
              experimentId
            }
          ]
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
          />
        ))}
      </div>
    </div>
  )
}
