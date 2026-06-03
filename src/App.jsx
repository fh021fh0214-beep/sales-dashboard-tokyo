import Dashboard from './SalesDashboard'
import PasswordGate from './PasswordGate'

function App() {
  return (
    <PasswordGate>
      <Dashboard />
    </PasswordGate>
  )
}

export default App
