import { Layers, Lightbulb, Bluetooth, ArrowLeftRight, RefreshCw } from 'lucide-react'
import { MODES, modeById } from '../modes'
import { useApp } from '../store'
import { Card, PageHeader, Toggle } from '../components/ui'

const EVENTS = [
  { icon: ArrowLeftRight, text: '切換至專注模式，透明度調整至 80%', time: '14:23' },
  { icon: Bluetooth, text: 'Bluetooth 裝置重新連線', time: '12:05' },
  { icon: Layers, text: '透明度超出授權上限，已自動截斷至 95%', time: '10:30' },
  { icon: RefreshCw, text: '裝置啟動，套用預設模式：專注', time: '09:15' },
  { icon: Bluetooth, text: 'Bluetooth 配對成功', time: '09:14' },
]

export default function Modes() {
  const { modeId, transparency, setTransparency, ledOn, setLedOn } = useApp()
  const mode = modeById(modeId)
  const Icon = mode.icon

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="智慧屏風" />

      {/* Current mode card */}
      <Card className="overflow-hidden" >
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

      {/* Transparency slider */}
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
            className="h-2 w-full cursor-pointer appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, ${mode.color} ${transparency}%, #eae8e1 ${transparency}%)`,
              accentColor: mode.color,
            }}
          />
        </div>
      </Card>

      {/* LED preference */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-black/5 px-5 pb-4 pt-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-app">
            <Lightbulb size={18} className="text-muted" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold">狀態燈偏好</p>
            <p className="pt-0.5 text-[12px] leading-4 text-muted">
              屏風側邊 LED 顯示目前工作模式顏色
            </p>
          </div>
          <Toggle on={ledOn} onChange={setLedOn} />
        </div>
        <div className="flex gap-2 px-5 py-2">
          {MODES.map((m) => (
            <div key={m.id} className="flex w-[62px] flex-col items-center gap-1 py-1.5">
              <div
                className="size-5 rounded-full"
                style={{
                  background: m.color,
                  boxShadow: ledOn && m.id === modeId ? `0 0 7px ${m.color}` : undefined,
                  opacity: ledOn ? 1 : 0.35,
                }}
              />
              <p className="text-[12px] text-muted">{m.en}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent events */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <p className="text-[14px] font-bold">近期事件</p>
          <p className="text-[12px] text-muted">今日</p>
        </div>
        {EVENTS.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 border-t border-black/5 px-4 py-3">
            <ev.icon size={14} className="mt-0.5 shrink-0 text-muted" />
            <p className="flex-1 text-[12px] leading-[1.4]">{ev.text}</p>
            <span className="font-mono text-[12px] text-muted">{ev.time}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
