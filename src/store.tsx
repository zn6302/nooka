import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { modeById, type ModeId } from './modes'
import { socket, type LightState } from './socket'

interface AppState {
  modeId: ModeId
  setModeId: (id: ModeId) => void
  transparency: number
  setTransparency: (v: number) => void
  ledOn: boolean
  setLedOn: (v: boolean) => void
  ledBrightness: number
  setLedBrightness: (v: number) => void
  lightConnected: boolean
  workMinutes: number
  setWorkMinutes: (v: number) => void
  restMinutes: number
  setRestMinutes: (v: number) => void
  cycleReminder: boolean
  setCycleReminder: (v: boolean) => void
  suggestionDismissed: boolean
  dismissSuggestion: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [modeId, setModeIdRaw] = useState<ModeId>('focus')
  const [transparency, setTransparency] = useState(modeById('focus').defaultTransparency)
  const [ledOn, setLedOn] = useState(true)
  const [ledBrightness, setLedBrightnessRaw] = useState(80)
  const [lightConnected, setLightConnected] = useState(false)
  const [workMinutes, setWorkMinutes] = useState(50)
  const [restMinutes, setRestMinutes] = useState(10)
  const [cycleReminder, setCycleReminder] = useState(true)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)

  useEffect(() => {
    const handleDisconnect = () => setLightConnected(false)
    const handleHardwareStatus = (status: { connected: boolean }) => {
      setLightConnected(status.connected)
    }
    const handleState = (state: LightState) => {
      setLedOn(state.on)
      setLedBrightnessRaw(state.brightness)
    }

    socket.on('disconnect', handleDisconnect)
    socket.on('hardware:status', handleHardwareStatus)
    socket.on('light:state', handleState)
    socket.connect()

    return () => {
      socket.off('disconnect', handleDisconnect)
      socket.off('hardware:status', handleHardwareStatus)
      socket.off('light:state', handleState)
      socket.disconnect()
    }
  }, [])

  const updateLight = useCallback((update: Partial<LightState>) => {
    socket.emit('light:set', update)
  }, [])

  const setLedOnSynced = (on: boolean) => {
    setLedOn(on)
    updateLight({ on })
  }

  const setLedBrightness = (brightness: number) => {
    setLedBrightnessRaw(brightness)
    updateLight({ brightness })
  }

  const setModeId = (id: ModeId) => {
    setModeIdRaw(id)
    setTransparency(modeById(id).defaultTransparency)
    updateLight({ color: modeById(id).color })
  }

  return (
    <AppContext.Provider
      value={{
        modeId,
        setModeId,
        transparency,
        setTransparency,
        ledOn,
        setLedOn: setLedOnSynced,
        ledBrightness,
        setLedBrightness,
        lightConnected,
        workMinutes,
        setWorkMinutes,
        restMinutes,
        setRestMinutes,
        cycleReminder,
        setCycleReminder,
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
