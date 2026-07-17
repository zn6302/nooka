import { useRef, useState } from 'react'
import { Layers, Lightbulb, Bluetooth, Palette, ArrowLeftRight, Check } from 'lucide-react'
import { LED_COLORS, modeById, type ModeId } from '../modes'
import { useApp, type EventKind } from '../store'
import { Card, PageHeader, Toggle } from '../components/ui'

const EVENT_ICON: Record<EventKind, typeof ArrowLeftRight> = {
  mode: ArrowLeftRight,
  transparency: Layers,
  led: Palette,
}

export default function Modes() {
  const {
    transparency,
    setTransparency,
    ledOn,
    setLedOn,
    minTransparency,
    maxTransparency,
    modes,
    mode,
    modeColors,
    setModeColor,
    events,
    addEvent,
  } = useApp()
  const Icon = mode.icon

  // Which mode's color picker is currently expanded (null = collapsed)
  const [pickerModeId, setPickerModeId] = useState<ModeId | null>(null)

  // Value at the start of a slider drag, so we only log the net change once
  const dragStart = useRef<number | null>(null)

  const commitTransparencyLog = () => {
    if (dragStart.current === null) return
    if (transparency !== dragStart.current) {
      addEvent('transparency', `屏風透明度調整至 ${transparency}%`)
    }
    dragStart.current = null
  }

  const changeModeColor = (id: ModeId, color: string) => {
    if (modeColors[id].toLowerCase() === color.toLowerCase()) return
    setModeColor(id, color)
    addEvent('led', `${modeById(id).name} LED 顏色已更換`)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="智慧屏風" />

      {/* Current mode card */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 px-5 pb-4 pt-5" style={{ background: mode.soft }}>
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: mode.color }}
          >
            <Icon size={26} color="#fff" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-muted">
              目前模式
            </p>
            <p className="text-[24px] font-bold leading-[30px]">{mode.name}</p>
            <p className="text-[12px] leading-[1.4] text-muted">{mode.desc}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px border-t border-black/[0.06] bg-black/[0.06] pt-px">
          <div className="flex flex-col items-center gap-1.5 bg-white py-4">
            <Layers size={14} className="text-muted" />
            <p className="text-[12px] text-muted">屏風透明度</p>
            <p className="font-mono text-[20px] font-medium leading-5">{transparency}%</p>
            <div className="h-1.5 w-10 overflow-hidden rounded-full bg-track">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${transparency}%`, background: mode.color }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 bg-white py-4">
            <Lightbulb size={14} className="text-muted" />
            <p className="text-[12px] text-muted">狀態燈光</p>
            <div
              className="size-7 rounded-full"
              style={
                ledOn
                  ? { background: mode.color, boxShadow: `0 0 12px ${mode.color}61` }
                  : { background: '#f0eee9' }
              }
            />
            <p
              className="text-[12px] font-bold"
              style={{ color: ledOn ? mode.color : '#c8c5be' }}
            >
              {ledOn ? '開啟' : '關閉'}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5 bg-white py-4">
            <Bluetooth size={14} className="text-muted" />
            <p className="text-[12px] text-muted">Bluetooth</p>
            <div className="flex size-7 items-center justify-center rounded-full bg-[#f0eee9]">
              <Bluetooth size={14} className="text-faint" />
            </div>
            <p className="text-[12px] font-bold text-faint">未配對</p>
          </div>
        </div>
      </Card>

      {/* Transparency slider — clamped to the authorized range */}
      <Card className="p-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">屏風透明度</span>
            <span className="font-mono text-[14px] font-medium" style={{ color: mode.color }}>
              {transparency}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={transparency}
            onChange={(e) => setTransparency(Number(e.target.value))}
            onPointerDown={() => (dragStart.current = transparency)}
            onPointerUp={commitTransparencyLog}
            onKeyDown={(e) => {
              if (dragStart.current === null) dragStart.current = transparency
              if (e.key === 'Enter') commitTransparencyLog()
            }}
            onBlur={commitTransparencyLog}
            className="h-2 w-full cursor-pointer appearance-none rounded-full"
            style={{
              // out-of-range zones show as dim gray so the authorized band is obvious
              background: `linear-gradient(to right,
                #dcdad3 0%, #dcdad3 ${minTransparency}%,
                #eae8e1 ${minTransparency}%, #eae8e1 ${transparency}%,
                ${mode.color} ${minTransparency}%, ${mode.color} ${transparency}%,
                #eae8e1 ${transparency}%, #eae8e1 ${maxTransparency}%,
                #dcdad3 ${maxTransparency}%, #dcdad3 100%)`,
              accentColor: mode.color,
            }}
          />
          <div className="flex justify-between text-[12px] text-muted">
            <span>下限 {minTransparency}%</span>
            <span>上限 {maxTransparency}%</span>
          </div>
        </div>
      </Card>

      {/* LED preference — colors are customizable per mode */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-black/5 px-5 pb-4 pt-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-app">
            <Lightbulb size={18} className="text-muted" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold">狀態燈偏好</p>
            <p className="pt-0.5 text-[12px] leading-4 text-muted">
              {ledOn ? '點擊模式即可更換代表色' : '屏風側邊 LED 顯示目前工作模式顏色'}
            </p>
          </div>
          <Toggle on={ledOn} onChange={setLedOn} />
        </div>

        <div className="flex gap-2 px-5 py-2">
          {modes.map((m) => {
            const expanded = pickerModeId === m.id
            return (
              <button
                key={m.id}
                type="button"
                disabled={!ledOn}
                aria-expanded={expanded}
                onClick={() => setPickerModeId(expanded ? null : m.id)}
                className={`flex w-[62px] flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
                  ledOn && expanded ? 'bg-app' : ''
                }`}
              >
                <div
                  className="size-5 rounded-full"
                  style={{
                    background: m.color,
                    boxShadow: ledOn && expanded ? `0 0 7px ${m.color}` : undefined,
                    opacity: ledOn ? 1 : 0.35,
                  }}
                />
                <p className="text-[12px] text-muted">{m.en}</p>
              </button>
            )
          })}
        </div>

        {/* Color picker — only shown for the mode whose dot was tapped */}
        {ledOn && pickerModeId && (
          <div className="mx-5 mb-4 rounded-2xl bg-app p-3">
            <p className="pb-2 text-[12px] font-semibold text-muted">
              {modeById(pickerModeId).name} · 選擇 LED 顏色
            </p>
            <div className="grid grid-cols-6 gap-2.5">
              {LED_COLORS.map((c) => {
                const selected = modeColors[pickerModeId].toLowerCase() === c.toLowerCase()
                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={`設定 ${modeById(pickerModeId).name} 顏色為 ${c}`}
                    aria-pressed={selected}
                    onClick={() => changeModeColor(pickerModeId, c)}
                    className="flex aspect-square items-center justify-center rounded-full transition-transform active:scale-90"
                    style={{
                      background: c,
                      boxShadow: selected ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : undefined,
                    }}
                  >
                    {selected && <Check size={16} color="#fff" strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Recent events — real activity log recorded from user actions */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <p className="text-[14px] font-bold">近期事件</p>
          <p className="text-[12px] text-muted">今日</p>
        </div>
        {events.length === 0 ? (
          <p className="border-t border-black/5 px-4 py-6 text-center text-[12px] text-muted">
            尚無事件，操作屏風後會記錄於此
          </p>
        ) : (
          events.map((ev) => {
            const EvIcon = EVENT_ICON[ev.kind]
            return (
              <div
                key={ev.id}
                className="flex items-start gap-3 border-t border-black/5 px-4 py-3"
              >
                <EvIcon size={14} className="mt-0.5 shrink-0 text-muted" />
                <p className="flex-1 text-[12px] leading-[1.4]">{ev.text}</p>
                <span className="font-mono text-[12px] text-muted">{ev.time}</span>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
