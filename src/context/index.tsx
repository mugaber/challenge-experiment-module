import { createContext, useContext } from 'react'
import { type Experiment } from '../types'

export interface ExperimentsContextType {
  experiments: Experiment[]
  activeIteration: { iterationId: number; experimentId: number } | null
  handleAddIteration: (experimentId: number) => void
  handleIterationUpdate: (operation: 'done' | 'cancel') => void
  handleLockStatus: (experimentId: number) => void
  handleResetExperiment: (experimentId: number) => void
}

export const ExperimentsContext = createContext<ExperimentsContextType | null>(
  null
)

export const useExperimentsContext = () => {
  const context = useContext(ExperimentsContext)
  if (!context) {
    throw new Error(
      'useExperimentsContext must be used within an ExperimentsProvider'
    )
  }
  return context
}
