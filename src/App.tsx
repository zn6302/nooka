import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Modes from './pages/Modes'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import WorkRestCycle from './pages/WorkRestCycle'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/modes" element={<Modes />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/work-cycle" element={<WorkRestCycle />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
