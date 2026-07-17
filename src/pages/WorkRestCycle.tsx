import { Link } from 'react-router-dom'
import { ChevronLeft, Clock, Bell } from 'lucide-react'
import { useApp } from '../store'
import { Card, Toggle } from '../components/ui'

const PRESETS = [
  { label: '番茄鐘', work: 25, rest: 5 },
  { label: '標準', work: 50, rest: 10 },
  { label: '深度', work: 90, rest: 15 },
] as const

function DurationSlider({
  label,
  value,
  min,
  max,
  step,
  color,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  color: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold">{label}</p>
        <p className="font-mono text-[14px] font-medium" style={{ color }}>
          {value} 分
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, #eae8e1 ${pct}%)`,
          accentColor: color,
        }}
      />
      <div className="flex justify-between pt-1 text-[12px] text-muted">
        <span>{min} 分</span>
        <span>{max} 分</span>
      </div>
    </div>
  )
}

export default function WorkRestCycle() {
  const {
    workMinutes,
    setWorkMinutes,
    restMinutes,
    setRestMinutes,
    cycleReminder,
    setCycleReminder,
  } = useApp()

  const activePreset = PRESETS.find((p) => p.work === workMinutes && p.rest === restMinutes)?.label

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/settings"
        className="flex items-center gap-1 text-[14px] font-bold text-brand"
      >
        <ChevronLeft size={18} />
        返回設定
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-muted" />
          <h1 className="text-[20px] font-bold leading-7">工作與休息週期</h1>
        </div>
        <p className="text-[12px] leading-[1.6] text-muted">
          設定專注與休息的時間長度，系統將在週期結束時提醒你切換模式。
        </p>
      </div>

      <Card className="p-5">
        <p className="text-[14px] font-bold">快速預設</p>
        <div className="flex gap-2 pt-3">
          {PRESETS.map((preset) => {
            const selected = preset.label === activePreset
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setWorkMinutes(preset.work)
                  setRestMinutes(preset.rest)
                }}
                className={`flex-1 rounded-2xl px-3 py-2.5 text-center transition-colors ${
                  selected ? 'bg-brand text-white' : 'bg-app text-ink'
                }`}
              >
                <p className="text-[13px] font-bold">{preset.label}</p>
                <p className={`pt-0.5 text-[11px] ${selected ? 'text-white/75' : 'text-muted'}`}>
                  {preset.work}/{preset.rest} 分
                </p>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-5">
        <DurationSlider
          label="專注時間"
          value={workMinutes}
          min={15}
          max={120}
          step={5}
          color="#d65a57"
          onChange={setWorkMinutes}
        />
        <DurationSlider
          label="休息時間"
          value={restMinutes}
          min={5}
          max={30}
          step={5}
          color="#6db08b"
          onChange={setRestMinutes}
        />
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-app">
            <Bell size={18} className="text-muted" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold">週期結束提醒</p>
            <p className="pt-0.5 text-[12px] leading-4 text-muted">
              專注時間結束時推送休息建議
            </p>
          </div>
          <Toggle on={cycleReminder} onChange={setCycleReminder} />
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-[12px] text-muted">目前週期摘要</p>
        <p className="pt-1 text-[16px] font-bold">
          專注 {workMinutes} 分 → 休息 {restMinutes} 分
        </p>
        <p className="pt-1 text-[12px] text-muted">
          一個完整週期共 {workMinutes + restMinutes} 分鐘
        </p>
      </Card>
    </div>
  )
}
