import { useState, type ReactNode } from 'react'
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
import { MODES, type ModeId } from '../modes'
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

export default function Settings() {
  const { ledOn, setLedOn, workMinutes, restMinutes } = useApp()
  const [paired, setPaired] = useState(false)
  const [defaultMode, setDefaultMode] = useState<ModeId>('focus')
  const [hrv, setHrv] = useState(true)
  const [standing, setStanding] = useState(true)
  const [calendar, setCalendar] = useState(true)
  const [minT, setMinT] = useState(20)
  const [maxT, setMaxT] = useState(95)
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
        {MODES.map((m) => {
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
        <p className="pt-0.5 pl-6 text-[12px] text-muted">限制透明度可調整的上下限</p>

        <div className="flex items-center justify-between pt-4">
          <p className="text-[14px] font-bold">最低透明度（下限）</p>
          <p className="font-mono text-[14px] font-medium text-brand">{minT}%</p>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={minT}
          onChange={(e) => setMinT(Math.min(Number(e.target.value), maxT))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, #6db08b ${minT}%, #eae8e1 ${minT}%)`,
            accentColor: '#3c7a58',
          }}
        />

        <div className="flex items-center justify-between pt-4">
          <p className="text-[14px] font-bold">最高透明度（上限）</p>
          <p className="font-mono text-[14px] font-medium text-brand">{maxT}%</p>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={maxT}
          onChange={(e) => setMaxT(Math.max(Number(e.target.value), minT))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(to right, #3c7a58 ${maxT}%, #eae8e1 ${maxT}%)`,
            accentColor: '#3c7a58',
          }}
        />

        <div
          className="mt-4 h-3 rounded-full"
          style={{
            background: `linear-gradient(to right, #eae8e1 ${minT}%, #d65a57 ${minT}%, #3c7a58 ${maxT}%, #eae8e1 ${maxT}%)`,
          }}
        />
        <div className="flex justify-between pt-2 text-[12px]">
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
