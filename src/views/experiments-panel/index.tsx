import ExperimentModule from '../../components/experiment-module'
import { initialExperiments } from '../../data'

export default function ExperimentsPanel() {
  return (
    <div className="w-screen h-screen overflow-y-auto">
      <div
        className="min-h-full flex flex-col items-center justify-center 
          gap-4 py-4"
      >
        {initialExperiments.map((experiment) => (
          <ExperimentModule key={experiment.id} experiment={experiment} />
        ))}
      </div>
    </div>
  )
}
