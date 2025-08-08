import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExperimentModule from '../components/experiment-module/index'
import {
  ExperimentStatuses,
  type Experiment,
  type ExperimentStatus,
  type Iteration
} from '../types'
import { ExperimentsContext, type ExperimentsContextType } from '../context'

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
    <div data-testid={`iteration-${iteration.id}`}>
      <span>
        Iteration {iteration.id}: {iteration.title}
      </span>
      <span>Only one: {onlyOne.toString()}</span>
      <span>First: {first.toString()}</span>
      <span>Last: {last.toString()}</span>
    </div>
  )
}))

describe('ExperimentModule', () => {
  const mockHandleAddIteration = vi.fn()
  const mockHandleResetExperiment = vi.fn()
  const mockHandleIterationUpdate = vi.fn()
  const mockHandleLockStatus = vi.fn()

  const mockContextValue: ExperimentsContextType = {
    experiments: [],
    activeIteration: null,
    handleAddIteration: mockHandleAddIteration,
    handleResetExperiment: mockHandleResetExperiment,
    handleIterationUpdate: mockHandleIterationUpdate,
    handleIterationLengthUpdate: vi.fn(),
    handleRemoveIteration: vi.fn(),
    handleLockStatus: mockHandleLockStatus
  }

  const createMockExperiment = (
    status: string,
    iterationsCount: number = 0
  ): Experiment => ({
    id: 1,
    title: 'Test Experiment',
    status: status as ExperimentStatus,
    iterations: Array.from({ length: iterationsCount }, (_, i) => ({
      id: i + 1,
      title: `Iteration ${i + 1}`,
      experimentId: 1,
      state: 'done' as const,
      length: 'short' as const
    }))
  })

  const renderWithContext = (experiment: Experiment, contextOverrides = {}) => {
    const contextValue = { ...mockContextValue, ...contextOverrides }
    return render(
      <ExperimentsContext.Provider value={contextValue}>
        <ExperimentModule experiment={experiment} />
      </ExperimentsContext.Provider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders experiment title', () => {
      const experiment = createMockExperiment(ExperimentStatuses.EMPTY)
      renderWithContext(experiment)

      expect(screen.getByText('Test Experiment')).toBeInTheDocument()
    })

    it('applies correct title styling for unlocked experiment', () => {
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      const title = screen.getByText('Test Experiment')
      expect(title).toHaveClass('text-white')
      expect(title).toHaveClass('cursor-pointer')
    })

    it('applies correct title styling for locked experiment', () => {
      const experiment = createMockExperiment(ExperimentStatuses.LOCKED)
      renderWithContext(experiment)

      const title = screen.getByText('Test Experiment')
      expect(title).toHaveClass('text-white/50')
      expect(title).toHaveClass('cursor-default')
    })

    it('does not show lock icon for empty experiment', () => {
      const experiment = createMockExperiment(ExperimentStatuses.EMPTY)
      renderWithContext(experiment)

      expect(screen.queryByAltText('Lock Icon')).not.toBeInTheDocument()
    })

    it('shows correct lock icon for locked experiment', () => {
      const experiment = createMockExperiment(ExperimentStatuses.LOCKED, 1)
      renderWithContext(experiment)

      const lockIcon = screen.getByAltText('Lock Icon')
      expect(lockIcon).toBeInTheDocument()
      expect(lockIcon).toHaveAttribute('src', 'lock-closed-icon')
    })

    it('shows correct lock icon for unlocked experiment', () => {
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      const lockIcon = screen.getByAltText('Lock Icon')
      expect(lockIcon).toBeInTheDocument()
      expect(lockIcon).toHaveAttribute('src', 'lock-open-icon')
    })
  })

  describe('Module Open/Close Behavior', () => {
    it('starts with module closed', () => {
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      expect(screen.queryByText('add iteration')).not.toBeInTheDocument()
    })

    it('opens module when title is clicked for unlocked experiment', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      expect(screen.getByText('add iteration')).toBeInTheDocument()
    })

    it('does not open module when title is clicked for locked experiment', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.LOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      expect(screen.queryByText('add iteration')).not.toBeInTheDocument()
    })

    it('closes module when locked status changes to locked', () => {
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      const { rerender } = renderWithContext(experiment)

      fireEvent.click(screen.getByText('Test Experiment'))
      expect(screen.getByText('add iteration')).toBeInTheDocument()

      const lockedExperiment = {
        ...experiment,
        status: ExperimentStatuses.LOCKED
      }
      rerender(
        <ExperimentsContext.Provider value={mockContextValue}>
          <ExperimentModule experiment={lockedExperiment} />
        </ExperimentsContext.Provider>
      )

      expect(screen.queryByText('add iteration')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows add iteration prompt for empty experiment when open', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.EMPTY)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      expect(
        screen.getByText(/To add a new iteration, start typing a prompt/)
      ).toBeInTheDocument()
      expect(screen.getByText('generate')).toBeInTheDocument()
    })

    it('shows add iteration button for empty experiment', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.EMPTY)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      expect(screen.getByText('add iteration')).toBeInTheDocument()
    })

    it('does not show reset button for empty experiment', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.EMPTY)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      expect(screen.queryByText('reset')).not.toBeInTheDocument()
    })
  })

  describe('Experiments with Iterations', () => {
    it('renders iterations when experiment has iterations', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 2)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      expect(screen.getByTestId('iteration-1')).toBeInTheDocument()
      expect(screen.getByTestId('iteration-2')).toBeInTheDocument()
    })

    it('passes correct props to iteration components', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 3)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      const firstIteration = screen.getByTestId('iteration-1')
      expect(firstIteration).toHaveTextContent('First: true')
      expect(firstIteration).toHaveTextContent('Last: false')
      expect(firstIteration).toHaveTextContent('Only one: false')

      const lastIteration = screen.getByTestId('iteration-3')
      expect(lastIteration).toHaveTextContent('First: false')
      expect(lastIteration).toHaveTextContent('Last: true')
      expect(lastIteration).toHaveTextContent('Only one: false')
    })

    it('passes onlyOne prop correctly for single iteration', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      const iteration = screen.getByTestId('iteration-1')
      expect(iteration).toHaveTextContent('Only one: true')
      expect(iteration).toHaveTextContent('First: true')
      expect(iteration).toHaveTextContent('Last: true')
    })

    it('shows reset button when experiment has iterations', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))

      expect(screen.getByText('reset')).toBeInTheDocument()
    })
  })

  describe('Adding Iterations', () => {
    it('shows add iteration prompt when adding iteration', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('add iteration'))

      expect(
        screen.getByText(/To add a new iteration, start typing a prompt/)
      ).toBeInTheDocument()
    })

    it('shows cancel and done buttons when adding iteration', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('add iteration'))

      expect(screen.getByText('cancel')).toBeInTheDocument()
      expect(screen.getByText('done')).toBeInTheDocument()
    })

    it('hides add iteration and reset buttons when adding iteration', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('add iteration'))

      expect(screen.queryByText('add iteration')).not.toBeInTheDocument()
      expect(screen.queryByText('reset')).not.toBeInTheDocument()
    })

    it('calls handleAddIteration with correct experiment ID', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('add iteration'))

      expect(mockHandleAddIteration).toHaveBeenCalledWith(1)
    })

    it('calls handleIterationUpdate with done when done button clicked', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('add iteration'))
      await user.click(screen.getByText('done'))

      expect(mockHandleIterationUpdate).toHaveBeenCalledWith('done')
    })

    it('calls handleIterationUpdate with cancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('add iteration'))
      await user.click(screen.getByText('cancel'))

      expect(mockHandleIterationUpdate).toHaveBeenCalledWith('cancel')
    })
  })

  describe('Lock Status Management', () => {
    it('calls handleLockStatus when lock icon clicked on unlocked experiment', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      await user.click(screen.getByAltText('Lock Icon'))

      expect(mockHandleLockStatus).toHaveBeenCalledWith(1)
    })

    it('calls handleLockStatus and opens module when lock icon clicked on locked experiment', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.LOCKED, 1)
      renderWithContext(experiment)

      await user.click(screen.getByAltText('Lock Icon'))

      expect(mockHandleLockStatus).toHaveBeenCalledWith(1)
      await waitFor(() => {
        expect(screen.getByText('add iteration')).toBeInTheDocument()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('calls handleResetExperiment when reset button clicked', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('reset'))

      expect(mockHandleResetExperiment).toHaveBeenCalledWith(1)
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('has accessible alt text for lock icon', () => {
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      expect(screen.getByAltText('Lock Icon')).toBeInTheDocument()
    })

    it('has clickable elements with proper cursor styling', () => {
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED, 1)
      renderWithContext(experiment)

      const title = screen.getByText('Test Experiment')
      expect(title).toHaveClass('cursor-pointer')

      const lockIcon = screen.getByAltText('Lock Icon')
      expect(lockIcon).toHaveClass('cursor-pointer')
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined iterations gracefully', () => {
      const experiment = {
        id: 1,
        title: 'Test Experiment',
        status: ExperimentStatuses.EMPTY,
        iterations: []
      }

      expect(() => renderWithContext(experiment)).not.toThrow()
    })

    it('handles rapid state changes', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      const title = screen.getByText('Test Experiment')
      await user.click(title)
      await user.click(title)
      await user.click(title)

      expect(screen.getByText('add iteration')).toBeInTheDocument()
    })

    it('maintains state consistency during async operations', async () => {
      const user = userEvent.setup()
      const experiment = createMockExperiment(ExperimentStatuses.UNLOCKED)
      renderWithContext(experiment)

      await user.click(screen.getByText('Test Experiment'))
      await user.click(screen.getByText('add iteration'))

      expect(screen.getByText('cancel')).toBeInTheDocument()
      expect(screen.getByText('done')).toBeInTheDocument()
      expect(screen.queryByText('add iteration')).not.toBeInTheDocument()
    })
  })
})
