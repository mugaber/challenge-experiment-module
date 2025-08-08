import { describe, it, expect, vi } from 'vitest'
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExperimentModule from '../components/experiment-module/index'
import {
  renderWithContext,
  testExperiments,
  createTestExperiment,
  createTestIteration
} from '../test/utils'
import {
  ExperimentStatuses,
  type Iteration,
  type ExperimentStatus
} from '../types'

vi.mock('../assets/lock-open.svg', () => ({
  default: 'lock-open-icon'
}))
vi.mock('../assets/lock-closed.svg', () => ({
  default: 'lock-closed-icon'
}))

describe('ExperimentModule Integration Tests', () => {
  describe('Full User Workflows', () => {
    it('completes full workflow: empty -> add iteration -> cancel -> add again -> done', async () => {
      const user = userEvent.setup()
      const mockHandleAddIteration = vi.fn()
      const mockHandleIterationUpdate = vi.fn()

      renderWithContext(
        <ExperimentModule experiment={testExperiments.empty} />,
        {
          contextValue: {
            handleAddIteration: mockHandleAddIteration,
            handleIterationUpdate: mockHandleIterationUpdate
          }
        }
      )

      await user.click(screen.getByText('Empty Experiment'))
      expect(screen.getByText(/To add a new iteration/)).toBeInTheDocument()

      const addButton = screen.getByText('add iteration')
      await user.click(addButton)
      expect(mockHandleAddIteration).toHaveBeenCalledWith(1)
      expect(screen.getByText('cancel')).toBeInTheDocument()
      expect(screen.getByText('done')).toBeInTheDocument()

      await user.click(screen.getByText('cancel'))
      expect(mockHandleIterationUpdate).toHaveBeenCalledWith('cancel')

      await user.click(screen.getByText('add iteration'))
      expect(mockHandleAddIteration).toHaveBeenCalledTimes(2)

      await user.click(screen.getByText('done'))
      expect(mockHandleIterationUpdate).toHaveBeenCalledWith('done')
    })

    it('completes lock/unlock workflow with module state management', async () => {
      const user = userEvent.setup()
      const mockHandleLockStatus = vi.fn()

      const unlockedExperiment = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Test Experiment',
        [createTestIteration(1, 1)]
      )

      renderWithContext(<ExperimentModule experiment={unlockedExperiment} />, {
        contextValue: {
          handleLockStatus: mockHandleLockStatus
        }
      })

      await user.click(screen.getByText('Test Experiment'))
      expect(screen.getByText('add iteration')).toBeInTheDocument()

      await user.click(screen.getByAltText('Lock Icon'))
      expect(mockHandleLockStatus).toHaveBeenCalledWith(1)

      await user.click(screen.getByAltText('Lock Icon'))
      expect(mockHandleLockStatus).toHaveBeenCalledTimes(2)
    })

    it('handles complex iteration management workflow', async () => {
      const user = userEvent.setup()
      const mockHandleResetExperiment = vi.fn()
      const mockHandleAddIteration = vi.fn()

      const experimentWithIterations = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Complex Experiment',
        [
          createTestIteration(1, 1, 'First Iteration'),
          createTestIteration(2, 1, 'Second Iteration'),
          createTestIteration(3, 1, 'Third Iteration')
        ]
      )

      renderWithContext(
        <ExperimentModule experiment={experimentWithIterations} />,
        {
          contextValue: {
            handleResetExperiment: mockHandleResetExperiment,
            handleAddIteration: mockHandleAddIteration
          }
        }
      )

      await user.click(screen.getByText('Complex Experiment'))

      expect(screen.getByText('First Iteration')).toBeInTheDocument()
      expect(screen.getByText('Second Iteration')).toBeInTheDocument()
      expect(screen.getByText('Third Iteration')).toBeInTheDocument()

      await user.click(screen.getByText('add iteration'))
      expect(mockHandleAddIteration).toHaveBeenCalledWith(1)

      await user.click(screen.getByText('cancel'))

      await user.click(screen.getByText('reset'))
      expect(mockHandleResetExperiment).toHaveBeenCalledWith(1)
    })
  })

  describe('State Synchronization', () => {
    it('maintains consistent state during rapid user interactions', async () => {
      const user = userEvent.setup()
      const mockHandleAddIteration = vi.fn()
      const mockHandleIterationUpdate = vi.fn()

      renderWithContext(
        <ExperimentModule experiment={testExperiments.empty} />,
        {
          contextValue: {
            handleAddIteration: mockHandleAddIteration,
            handleIterationUpdate: mockHandleIterationUpdate
          }
        }
      )

      await user.click(screen.getByText('Empty Experiment'))

      await user.click(screen.getByText('add iteration'))
      await user.click(screen.getByText('cancel'))
      await user.click(screen.getByText('add iteration'))
      await user.click(screen.getByText('done'))

      expect(mockHandleAddIteration).toHaveBeenCalledTimes(2)
      expect(mockHandleIterationUpdate).toHaveBeenCalledTimes(2)
      expect(mockHandleIterationUpdate).toHaveBeenNthCalledWith(1, 'cancel')
      expect(mockHandleIterationUpdate).toHaveBeenNthCalledWith(2, 'done')
    })

    it('handles context updates during user interaction', async () => {
      const user = userEvent.setup()

      const { rerender } = renderWithContext(
        <ExperimentModule experiment={testExperiments.unlocked} />
      )

      await user.click(screen.getByText('Unlocked Experiment'))
      expect(screen.getByText('add iteration')).toBeInTheDocument()

      const updatedExperiment = createTestExperiment(
        2,
        ExperimentStatuses.UNLOCKED,
        'Unlocked Experiment',
        [
          createTestIteration(1, 2, 'Updated First'),
          createTestIteration(2, 2, 'Updated Second'),
          createTestIteration(3, 2, 'New Third Iteration')
        ]
      )

      rerender(<ExperimentModule experiment={updatedExperiment} />)

      expect(screen.getByText('Updated First')).toBeInTheDocument()
      expect(screen.getByText('New Third Iteration')).toBeInTheDocument()
    })
  })

  describe('Error Boundaries and Edge Cases', () => {
    it('handles missing context gracefully', () => {
      expect(() => {
        render(<ExperimentModule experiment={testExperiments.empty} />)
      }).toThrow()
    })

    it('handles malformed experiment data', () => {
      const malformedExperiment = {
        id: 1,
        title: '',
        status: 'invalid-status' as ExperimentStatus,
        iterations: [] as Iteration[]
      }

      expect(() => {
        renderWithContext(<ExperimentModule experiment={malformedExperiment} />)
      }).not.toThrow()
    })

    it('maintains accessibility during all interactions', async () => {
      const user = userEvent.setup()

      renderWithContext(
        <ExperimentModule experiment={testExperiments.unlocked} />
      )

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()

      await user.click(screen.getByText('Unlocked Experiment'))

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('disabled')
      })
    })
  })

  describe('Performance Considerations', () => {
    it('does not cause unnecessary re-renders', async () => {
      const user = userEvent.setup()
      const mockHandleAddIteration = vi.fn()

      renderWithContext(
        <ExperimentModule experiment={testExperiments.empty} />,
        {
          contextValue: {
            handleAddIteration: mockHandleAddIteration
          }
        }
      )

      await user.click(screen.getByText('Empty Experiment'))
      await user.click(screen.getByText('add iteration'))

      expect(mockHandleAddIteration).toHaveBeenCalledTimes(1)

      await user.click(screen.getByText('cancel'))
      await user.click(screen.getByText('add iteration'))

      expect(mockHandleAddIteration).toHaveBeenCalledTimes(2)
    })

    it('handles large numbers of iterations efficiently', async () => {
      const user = userEvent.setup()
      const manyIterations = Array.from({ length: 50 }, (_, i) =>
        createTestIteration(i + 1, 1, `Iteration ${i + 1}`)
      )

      const largeExperiment = createTestExperiment(
        1,
        ExperimentStatuses.UNLOCKED,
        'Large Experiment',
        manyIterations
      )

      const startTime = performance.now()
      renderWithContext(<ExperimentModule experiment={largeExperiment} />)
      const renderTime = performance.now() - startTime

      expect(renderTime).toBeLessThan(100) // 100ms threshold

      await user.click(screen.getByText('Large Experiment'))

      expect(screen.getByText('Iteration 1')).toBeInTheDocument()
      expect(screen.getByText('Iteration 50')).toBeInTheDocument()
    })
  })
})
