import { describe, it, expect, vi } from 'vitest'
import ExperimentModule from '../components/experiment-module/index'
import {
  renderWithContext,
  testExperiments,
  createTestExperiment,
  createTestIteration
} from '../test/utils'
import { ExperimentStatuses, type Iteration } from '../types'

vi.mock('../assets/lock-open.svg', () => ({
  default: 'lock-open-icon'
}))
vi.mock('../assets/lock-closed.svg', () => ({
  default: 'lock-closed-icon'
}))

vi.mock('../components/Iteration', () => ({
  default: ({
    iteration,
    onlyOne,
    first,
    last
  }: {
    iteration: Iteration
    onlyOne: boolean
    first: boolean
    last: boolean
  }) => (
    <div
      data-testid={`iteration-${iteration.id}`}
      data-iteration-props={JSON.stringify({ onlyOne, first, last })}
    >
      <span>{iteration.title}</span>
      <span data-state={iteration.state}>{iteration.state}</span>
      <span data-length={iteration.length}>{iteration.length}</span>
    </div>
  )
}))

vi.mock('../components/buttons/transparent', () => ({
  default: ({
    children,
    onClick
  }: {
    children: React.ReactNode
    onClick: () => void
  }) => (
    <button onClick={onClick} data-component="transparent-button">
      {children}
    </button>
  )
}))

describe('ExperimentModule Snapshot Tests', () => {
  describe('Different States', () => {
    it('matches snapshot for empty experiment (closed)', () => {
      const { container } = renderWithContext(
        <ExperimentModule experiment={testExperiments.empty} />
      )
      expect(container.firstChild).toMatchSnapshot('empty-experiment-closed')
    })

    it('matches snapshot for empty experiment (open)', () => {
      const { container } = renderWithContext(
        <ExperimentModule experiment={testExperiments.empty} />
      )
      expect(container.firstChild).toMatchSnapshot('empty-experiment-open')
    })

    it('matches snapshot for unlocked experiment with iterations', () => {
      const { container } = renderWithContext(
        <ExperimentModule experiment={testExperiments.unlocked} />
      )
      expect(container.firstChild).toMatchSnapshot(
        'unlocked-experiment-with-iterations'
      )
    })

    it('matches snapshot for locked experiment', () => {
      const { container } = renderWithContext(
        <ExperimentModule experiment={testExperiments.locked} />
      )
      expect(container.firstChild).toMatchSnapshot('locked-experiment')
    })

    it('matches snapshot for single iteration experiment', () => {
      const singleIterationExperiment = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Single Iteration',
        [createTestIteration(1, 1, 'Only Iteration')]
      )

      const { container } = renderWithContext(
        <ExperimentModule experiment={singleIterationExperiment} />
      )
      expect(container.firstChild).toMatchSnapshot(
        'single-iteration-experiment'
      )
    })
  })

  describe('Different Iteration Configurations', () => {
    it('matches snapshot for experiment with mixed iteration states', () => {
      const mixedStateExperiment = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Mixed States',
        [
          createTestIteration(1, 1, 'Done Iteration', 'done', 'short'),
          createTestIteration(2, 1, 'Pending Iteration', 'pending', 'medium'),
          createTestIteration(3, 1, 'Another Done', 'done', 'long')
        ]
      )

      const { container } = renderWithContext(
        <ExperimentModule experiment={mixedStateExperiment} />
      )
      expect(container.firstChild).toMatchSnapshot('mixed-iteration-states')
    })

    it('matches snapshot for experiment with different iteration lengths', () => {
      const differentLengthsExperiment = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Different Lengths',
        [
          createTestIteration(1, 1, 'Short Iteration', 'done', 'short'),
          createTestIteration(2, 1, 'Medium Iteration', 'done', 'medium'),
          createTestIteration(3, 1, 'Long Iteration', 'done', 'long')
        ]
      )

      const { container } = renderWithContext(
        <ExperimentModule experiment={differentLengthsExperiment} />
      )
      expect(container.firstChild).toMatchSnapshot(
        'different-iteration-lengths'
      )
    })
  })

  describe('Interactive States', () => {
    it('matches snapshot when adding iteration', () => {
      const { container } = renderWithContext(
        <ExperimentModule experiment={testExperiments.empty} />,
        {
          contextValue: {
            activeIteration: { iterationId: 1, experimentId: 1 }
          }
        }
      )
      expect(container.firstChild).toMatchSnapshot('adding-iteration-state')
    })

    it('matches snapshot for experiment with long title', () => {
      const longTitleExperiment = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Very Long Experiment Title That Might Wrap To Multiple Lines And Test Layout',
        [createTestIteration(1, 1)]
      )

      const { container } = renderWithContext(
        <ExperimentModule experiment={longTitleExperiment} />
      )
      expect(container.firstChild).toMatchSnapshot('long-title-experiment')
    })
  })

  describe('Edge Cases', () => {
    it('matches snapshot for experiment with no title', () => {
      const noTitleExperiment = createTestExperiment(
        1,
        ExperimentStatuses.EMPTY,
        '',
        []
      )

      const { container } = renderWithContext(
        <ExperimentModule experiment={noTitleExperiment} />
      )
      expect(container.firstChild).toMatchSnapshot('no-title-experiment')
    })

    it('matches snapshot for experiment with many iterations', () => {
      const manyIterations = Array.from({ length: 5 }, (_, i) =>
        createTestIteration(i + 1, 1, `Iteration ${i + 1}`, 'done', 'short')
      )

      const manyIterationsExperiment = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Many Iterations',
        manyIterations
      )

      const { container } = renderWithContext(
        <ExperimentModule experiment={manyIterationsExperiment} />
      )
      expect(container.firstChild).toMatchSnapshot('many-iterations-experiment')
    })
  })
})
