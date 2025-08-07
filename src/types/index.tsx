export type Iteration = {
  id: number
  title: string
  experimentId: number
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
