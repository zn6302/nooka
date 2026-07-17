import { createContext, useContext, useState, type ReactNode } from 'react'
import { modeById, type ModeId } from './modes'

interface AppState {
  modeId: ModeId
  setModeId: (id: ModeId) => void
  transparency: number
  setTransparency: (v: number) => void
  ledOn: boolean
  setLedOn: (v: boolean) => void
  suggestionDismissed: boolean
  dismissSuggestion: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [modeId, setModeIdRaw] = useState<ModeId>('focus')
  const [transparency, setTransparency] = useState(modeById('focus').defaultTransparency)
  const [ledOn, setLedOn] = useState(true)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)

  const setModeId = (id: ModeId) => {
    setModeIdRaw(id)
    setTransparency(modeById(id).defaultTransparency)
  }

  return (
    <AppContext.Provider
      value={{
        modeId,
        setModeId,
        transparency,
        setTransparency,
        ledOn,
        setLedOn,
        suggestionDismissed,
        dismissSuggestion: () => setSuggestionDismissed(true),
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
