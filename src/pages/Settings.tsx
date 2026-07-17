import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bluetooth,
  BluetoothOff,
  SlidersHorizontal,
  Clock,
  ChevronRight,
  CircleCheck,
  Lightbulb,
  Info,
  Heart,
  PersonStanding,
  LayoutGrid,
  Calendar,
  Layers,
  Bell,
  Shield,
} from 'lucide-react'
import { type ModeId } from '../modes'
import { useApp } from '../store'
import { Card, PageHeader, Toggle } from '../components/ui'

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
        {icon}
        <p className="text-[14px] font-bold">{title}</p>
      </div>
      {children}
    </Card>
  )
}

function ToggleRow({
  icon,
  title,
  desc,
  on,
  onChange,
}: {
  icon: ReactNode
  title: string
  desc?: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 border-t border-black/5 px-5 py-3.5 first:border-t-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-app">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-bold">{title}</p>
        {desc && <p className="pt-0.5 text-[12px] leading-4 text-muted">{desc}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

// Dual-thumb range bar: both handles live on one track and are dragged
// directly, so the display bar itself is the control (no separate sliders).
// The authorized band (max − min) must always span at least this much.
const MIN_GAP = 30

function RangeBar({
  min,
  max,
  onChange,
}: {
  min: number
  max: number
  onChange: (min: number, max: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)

  const valueFromEvent = (clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    return Math.round(Math.min(1, Math.max(0, ratio)) * 100)
  }

  const handleMove = (e: PointerEvent) => {
    const which = dragging.current
    if (!which) return
    const v = valueFromEvent(e.clientX)
    // Keep the two thumbs at least MIN_GAP apart. Once they hit that gap and
    // the user keeps dragging, the whole band translates instead of stopping.
    if (which === 'min') {
      const lo = Math.max(0, Math.min(v, 100 - MIN_GAP))
      onChange(lo, Math.max(max, lo + MIN_GAP))
    } else {
      const hi = Math.min(100, Math.max(v, MIN_GAP))
      onChange(Math.min(min, hi - MIN_GAP), hi)
    }
  }

  const stop = () => {
    dragging.current = null
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerup', stop)
  }

  const startDrag = (which: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = which
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stop)
  }

  const thumb =
    'absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-brand shadow-md active:cursor-grabbing'

  return (
    <div ref={trackRef} className="relative mt-4 h-3 select-none">
      {/* full track */}
      <div
        className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full"
        style={{
          background: `linear-gradient(to right, #eae8e1 ${min}%, #d65a57 ${min}%, #3c7a58 ${max}%, #eae8e1 ${max}%)`,
        }}
      />
      {/* lower-bound thumb */}
      <div
        role="slider"
        aria-label="最低透明度"
        aria-valuemin={0}
        aria-valuemax={max - MIN_GAP}
        aria-valuenow={min}
        className={thumb}
        style={{ left: `${min}%` }}
        onPointerDown={startDrag('min')}
      />
      {/* upper-bound thumb */}
      <div
        role="slider"
        aria-label="最高透明度"
        aria-valuemin={min + MIN_GAP}
        aria-valuemax={100}
        aria-valuenow={max}
        className={thumb}
        style={{ left: `${max}%` }}
        onPointerDown={startDrag('max')}
      />
    </div>
  )
}

export default function Settings() {
  const {
    ledOn,
    setLedOn,
    modes,
    minTransparency: minT,
    maxTransparency: maxT,
    setMinTransparency: setMinT,
    setMaxTransparency: setMaxT,
    workMinutes,
    restMinutes,
  } = useApp()
  const [paired, setPaired] = useState(false)
  const [defaultMode, setDefaultMode] = useState<ModeId>('focus')
  const [hrv, setHrv] = useState(true)
  const [standing, setStanding] = useState(true)
  const [calendar, setCalendar] = useState(true)
  const [notifyMode, setNotifyMode] = useState(true)
  const [notifyBt, setNotifyBt] = useState(true)
  const [notifyRange, setNotifyRange] = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="設定" />

      {/* Bluetooth */}
      <SectionCard icon={<Bluetooth size={15} className="text-ink" />} title="Bluetooth 連線">
        <div className="flex items-center gap-3 border-t border-black/5 px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-app">
            {paired ? (
              <Bluetooth size={18} className="text-brand" />
            ) : (
              <BluetoothOff size={18} className="text-muted" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold">Nooka 屏風</p>
            <p className="pt-0.5 text-[12px] text-muted">{paired ? '已連線' : '未配對'}</p>
          </div>
          <button
            type="button"
            onClick={() => setPaired(!paired)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-bold ${
              paired ? 'bg-app text-muted' : 'bg-brand text-white'
            }`}
          >
            {paired ? '中斷' : '配對'}
          </button>
        </div>
      </SectionCard>

      {/* Personalization */}
      <SectionCard
        icon={<SlidersHorizontal size={15} className="text-brand" />}
        title="個人化設定"
      >
        <Link
          to="/settings/work-cycle"
          className="flex w-full items-center gap-3 border-t border-black/5 px-5 py-3.5 text-left"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-app">
            <Clock size={18} className="text-muted" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold">工作與休息週期</p>
            <p className="pt-0.5 text-[12px] text-muted">
              專注 {workMinutes} 分 / 休息 {restMinutes} 分
            </p>
          </div>
          <ChevronRight size={16} className="text-faint" />
        </Link>

        <p className="border-t border-black/5 px-5 pb-1 pt-3 text-[12px] text-muted">
          預設模式（啟動時套用）
        </p>
        {modes.map((m) => {
          const Icon = m.icon
          const selected = m.id === defaultMode
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setDefaultMode(m.id)}
              className="flex w-full items-center gap-3 border-t border-black/5 px-5 py-3.5 text-left"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: m.soft }}
              >
                <Icon size={18} color={m.color} />
              </div>
              <p className="flex-1 text-[14px] font-bold">{m.name}</p>
              {selected && <CircleCheck size={20} className="text-brand" />}
            </button>
          )
        })}

        <ToggleRow
          icon={<Lightbulb size={18} className="text-muted" />}
          title="狀態燈光指示"
          desc="屏風側邊燈光顯示目前狀態"
          on={ledOn}
          onChange={setLedOn}
        />
      </SectionCard>

      {/* Health data */}
      <SectionCard icon={<Info size={15} className="text-muted" />} title="健康數據授權">
        <ToggleRow
          icon={<Heart size={18} className="text-brand" />}
          title="心率變異度"
          desc="僅用於即時判斷"
          on={hrv}
          onChange={setHrv}
        />
        <ToggleRow
          icon={<PersonStanding size={18} className="text-brand" />}
          title="站立小時/分鐘"
          desc="僅計算時間長度"
          on={standing}
          onChange={setStanding}
        />
      </SectionCard>

      {/* App permissions */}
      <SectionCard icon={<LayoutGrid size={15} className="text-brand" />} title="應用程式授權">
        <ToggleRow
          icon={<Calendar size={18} className="text-brand" />}
          title="行事曆"
          desc="只讀取忙碌/空閒/會議時段"
          on={calendar}
          onChange={setCalendar}
        />
      </SectionCard>

      {/* Transparency range */}
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-brand" />
          <p className="text-[14px] font-bold">數值授權範圍控制</p>
        </div>
        <p className="pt-0.5 pl-6 text-[12px] text-muted">拖曳下方色帶兩端的圓點調整上下限</p>

        <RangeBar
          min={minT}
          max={maxT}
          onChange={(lo, hi) => {
            setMinT(lo)
            setMaxT(hi)
          }}
        />
        <div className="flex justify-between pt-3 text-[12px]">
          <span className="text-muted">{minT}% 下限</span>
          <span className="font-bold text-brand">可調整 {maxT - minT}%</span>
          <span className="text-muted">上限 {maxT}%</span>
        </div>
      </Card>

      {/* Notifications */}
      <SectionCard icon={<Bell size={15} className="text-ink" />} title="通知設定">
        <ToggleRow
          icon={<LayoutGrid size={18} className="text-muted" />}
          title="模式切換通知"
          desc="切換工作模式時發送提示"
          on={notifyMode}
          onChange={setNotifyMode}
        />
        <ToggleRow
          icon={<Bluetooth size={18} className="text-muted" />}
          title="Bluetooth 狀態通知"
          desc="連線中斷或配對完成時提示"
          on={notifyBt}
          onChange={setNotifyBt}
        />
        <ToggleRow
          icon={<Shield size={18} className="text-muted" />}
          title="範圍限制提醒"
          desc="透明度超出授權範圍時警告"
          on={notifyRange}
          onChange={setNotifyRange}
        />
      </SectionCard>
    </div>
  )
}
