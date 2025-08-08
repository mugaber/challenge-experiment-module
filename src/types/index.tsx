export type IterationState = 'pending' | 'done'
export type IterationLength = 'short' | 'medium' | 'long'

export type Iteration = {
  id: number
  title: string
  experimentId: number
  state: IterationState
  length: IterationLength
}

export const ExperimentStatuses = {
  EMPTY: 'empty',
  LOCKED: 'locked',
  UNLOCKED: 'unlocked'
} as const

export type ExperimentStatus =
  (typeof ExperimentStatuses)[keyof typeof ExperimentStatuses]

export type Experiment = {
  id: number
  title: string
  status: ExperimentStatus
  iterations: Iteration[]
}
