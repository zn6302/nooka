import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { MODES, modeById, type Mode, type ModeId } from './modes'

type UsageMs = Record<ModeId, number>

// Default transparency authorization range (%)
const DEFAULT_MIN_TRANSPARENCY = 20
const DEFAULT_MAX_TRANSPARENCY = 95

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

type ModeColors = Record<ModeId, string>

export type EventKind = 'mode' | 'transparency' | 'led'

export interface AppEvent {
  id: number
  kind: EventKind
  text: string
  time: string // HH:MM
}

interface AppState {
  modeId: ModeId
  setModeId: (id: ModeId) => void
  transparency: number
  setTransparency: (v: number) => void
  ledOn: boolean
  setLedOn: (v: boolean) => void
  suggestionDismissed: boolean
  dismissSuggestion: () => void
  // Transparency authorization range (shared with Settings)
  minTransparency: number
  maxTransparency: number
  setMinTransparency: (v: number) => void
  setMaxTransparency: (v: number) => void
  // Clamp a value into the current authorization range
  clampTransparency: (v: number) => number
  // Per-mode custom LED colors
  modeColors: ModeColors
  setModeColor: (id: ModeId, color: string) => void
  // Mode with its current (possibly customized) color applied
  modes: Mode[]
  mode: Mode
  // Activity log
  events: AppEvent[]
  addEvent: (kind: EventKind, text: string) => void
  // Usage analytics
  switchCount: number
  // Settled usage per mode plus the live time in the current mode, in ms
  getUsage: () => UsageMs
}

const zeroUsage = (): UsageMs =>
  MODES.reduce((acc, m) => {
    acc[m.id] = 0
    return acc
  }, {} as UsageMs)

const nowHHMM = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [modeId, setModeIdRaw] = useState<ModeId>('focus')
  const [ledOn, setLedOn] = useState(true)
  const [suggestionDismissed, setSuggestionDismissed] = useState(false)

  // Authorization range for transparency
  const [minTransparency, setMinTransparencyRaw] = useState(DEFAULT_MIN_TRANSPARENCY)
  const [maxTransparency, setMaxTransparencyRaw] = useState(DEFAULT_MAX_TRANSPARENCY)

  const [transparency, setTransparencyRaw] = useState(() =>
    clamp(modeById('focus').defaultTransparency, DEFAULT_MIN_TRANSPARENCY, DEFAULT_MAX_TRANSPARENCY),
  )

  // Custom LED colors, keyed by mode id; defaults to each mode's built-in color
  const [modeColors, setModeColors] = useState<ModeColors>(() =>
    MODES.reduce((acc, m) => {
      acc[m.id] = m.color
      return acc
    }, {} as ModeColors),
  )

  const clampTransparency = (v: number) => clamp(v, minTransparency, maxTransparency)
  const setTransparency = (v: number) => setTransparencyRaw(clampTransparency(v))

  const setMinTransparency = (v: number) => {
    setMinTransparencyRaw(v)
    setTransparencyRaw((t) => clamp(t, v, maxTransparency))
  }

  const setMaxTransparency = (v: number) => {
    setMaxTransparencyRaw(v)
    setTransparencyRaw((t) => clamp(t, minTransparency, v))
  }

  // Usage tracking: settled ms per mode, count of switches, and when the
  // current mode was entered (so we can add its live duration on read)
  const [usageMs, setUsageMs] = useState<UsageMs>(zeroUsage)
  const [switchCount, setSwitchCount] = useState(0)
  const enteredAt = useRef(Date.now())

  // Fold the current mode's elapsed time into settled usage, resetting the clock
  const settleCurrent = () => {
    const now = Date.now()
    const elapsed = now - enteredAt.current
    enteredAt.current = now
    setUsageMs((prev) => ({ ...prev, [modeId]: prev[modeId] + elapsed }))
    return elapsed
  }

  const getUsage = (): UsageMs => ({
    ...usageMs,
    [modeId]: usageMs[modeId] + (Date.now() - enteredAt.current),
  })

  const setModeId = (id: ModeId) => {
    if (id !== modeId) {
      settleCurrent()
      setSwitchCount((n) => n + 1)
    }
    setModeIdRaw(id)
    setTransparencyRaw(clampTransparency(modeById(id).defaultTransparency))
  }

  const setModeColor = (id: ModeId, color: string) =>
    setModeColors((prev) => ({ ...prev, [id]: color }))

  // Activity log — newest first
  const [events, setEvents] = useState<AppEvent[]>([])
  const addEvent = (kind: EventKind, text: string) =>
    setEvents((prev) => [{ id: prev.length ? prev[0].id + 1 : 1, kind, text, time: nowHHMM() }, ...prev])

  // Modes with custom colors applied, so the whole app reflects the chosen LED color
  const modes = useMemo(
    () => MODES.map((m) => ({ ...m, color: modeColors[m.id], chipTextColor: modeColors[m.id] })),
    [modeColors],
  )
  const mode = useMemo(() => modes.find((m) => m.id === modeId)!, [modes, modeId])

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
        minTransparency,
        maxTransparency,
        setMinTransparency,
        setMaxTransparency,
        clampTransparency,
        modeColors,
        setModeColor,
        modes,
        mode,
        events,
        addEvent,
        switchCount,
        getUsage,
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
