import { render, type RenderOptions } from '@testing-library/react'
import { type UserEvent } from '@testing-library/user-event'
import { type ReactElement } from 'react'
import { ExperimentsContext, type ExperimentsContextType } from '../context'
import {
  ExperimentStatuses,
  type Experiment,
  type ExperimentStatus,
  type Iteration
} from '../types'
import { expect, vi } from 'vitest'

export const createMockContextValue = (
  overrides: Partial<ExperimentsContextType> = {}
): ExperimentsContextType => ({
  experiments: [],
  activeIteration: null,
  handleAddIteration: vi.fn(),
  handleResetExperiment: vi.fn(),
  handleIterationUpdate: vi.fn(),
  handleIterationLengthUpdate: vi.fn(),
  handleRemoveIteration: vi.fn(),
  handleLockStatus: vi.fn(),
  ...overrides
})

export const createTestExperiment = (
  id: number = 1,
  status: string = ExperimentStatuses.EMPTY,
  title: string = 'Test Experiment',
  iterations: Iteration[] = []
): Experiment => ({
  id,
  title,
  status: status as ExperimentStatus,
  iterations
})

export const createTestIteration = (
  id: number,
  experimentId: number = 1,
  title: string = `Iteration ${id}`,
  state: 'pending' | 'done' = 'done',
  length: 'short' | 'medium' | 'long' = 'short'
): Iteration => ({
  id,
  title,
  experimentId,
  state,
  length
})

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  contextValue?: Partial<ExperimentsContextType>
}

export const renderWithContext = (
  ui: ReactElement,
  { contextValue = {}, ...renderOptions }: CustomRenderOptions = {}
) => {
  const mockContextValue = createMockContextValue(contextValue)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ExperimentsContext.Provider value={mockContextValue}>
      {children}
    </ExperimentsContext.Provider>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockContextValue
  }
}

export const testExperiments = {
  empty: createTestExperiment(1, ExperimentStatuses.EMPTY, 'Empty Experiment'),
  unlocked: createTestExperiment(
    2,
    ExperimentStatuses.UNLOCKED,
    'Unlocked Experiment',
    [
      createTestIteration(1, 2, 'First Iteration'),
      createTestIteration(2, 2, 'Second Iteration', 'done', 'medium')
    ]
  ),
  locked: createTestExperiment(
    3,
    ExperimentStatuses.LOCKED,
    'Locked Experiment',
    [createTestIteration(1, 3, 'Locked Iteration', 'done', 'long')]
  )
}

export const expectElementToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectElementToNotExist = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument()
}

export const clickAndWait = async (user: UserEvent, element: HTMLElement) => {
  await user.click(element)
  await new Promise((resolve) => setTimeout(resolve, 0))
}
