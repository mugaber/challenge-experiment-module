import ExperimentModule from '../../components/experiment-module'
import { useExperimentsContext } from '../../context'

export default function ExperimentsPanel() {
  const { experiments } = useExperimentsContext()

  return (
    <div className="w-screen h-screen overflow-y-auto">
      <div
        className="min-h-full flex flex-col items-center justify-center 
          gap-4 py-4"
      >
        {experiments.map((experiment) => (
          <ExperimentModule key={experiment.id} experiment={experiment} />
        ))}
      </div>
    </div>
  )
}
