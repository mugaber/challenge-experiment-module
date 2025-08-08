import './App.css'
import ExperimentsProvider from './context/provider'
import ExperimentsPanel from './views/experiments-panel'

function App() {
  return (
    <ExperimentsProvider>
      <ExperimentsPanel />
    </ExperimentsProvider>
  )
}

export default App
