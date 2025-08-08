import { ExperimentStatuses, type Experiment } from '../types'

export const initialExperiments: Experiment[] = [
  {
    id: 1,
    title: 'Experiment Module',
    status: ExperimentStatuses.EMPTY,
    iterations: []
  },
  {
    id: 2,
    title: 'Experiment Module',
    status: ExperimentStatuses.UNLOCKED,
    iterations: [
      {
        id: 1,
        title: 'Iteration title',
        state: 'done',
        experimentId: 2,
        length: 'short'
      }
    ]
  },
  {
    id: 3,
    title: 'Experiment Module',
    status: ExperimentStatuses.LOCKED,
    iterations: [
      {
        id: 1,
        title: 'Iteration title',
        state: 'done',
        experimentId: 3,
        length: 'medium'
      },
      {
        id: 2,
        title: 'Iteration title',
        state: 'done',
        experimentId: 3,
        length: 'long'
      }
    ]
  }
]
