import lockOpenIcon from '../../assets/lock-open.svg'
import lockClosedIcon from '../../assets/lock-closed.svg'
import { ExperimentStatuses, type Experiment } from '../../types'

interface ExperimentModuleProps {
  experiment: Experiment
}

export default function ExperimentModule({
  experiment
}: ExperimentModuleProps) {
  const { status, title } = experiment
  const isEmpty = status === ExperimentStatuses.EMPTY
  const isLocked = status === ExperimentStatuses.LOCKED
  const isUnlocked = status === ExperimentStatuses.UNLOCKED

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-6
        bg-[#242424] rounded-lg w-11/12 sm:w-8/12 lg:w-6/12 2xl:w-4/12"
    >
      <div className="w-full flex justify-between items-center">
        <h3
          className={`text-2xl font-bold ${
            isUnlocked ? 'text-white' : 'text-white/50'
          }`}
        >
          {title}
        </h3>

        {!isEmpty && (
          <img
            src={isLocked ? lockClosedIcon : lockOpenIcon}
            alt="Lock Icon"
            className="w-6 h-6"
          />
        )}
      </div>
    </div>
  )
}
