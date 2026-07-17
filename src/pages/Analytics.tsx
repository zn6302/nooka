import { useState } from 'react'
import { MODES } from '../modes'
import { Card, PageHeader } from '../components/ui'

const DAYS = ['一', '二', '三', '四', '五', '六', '日']

// hours per mode per day: [focus, open, meeting, recovery]
const USAGE: [number, number, number, number][] = [
  [3, 1, 1, 0.5],
  [3.5, 1, 1, 0.5],
  [2.5, 0.5, 0.5, 0.5],
  [3.5, 1.5, 0.5, 0.5],
  [3, 1, 2, 0.5],
  [2, 1, 0.5, 1],
  [1.5, 1, 0, 1],
]

const fmt = (h: number) => (Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`)

function DonutChart({ totals, total }: { totals: number[]; total: number }) {
  const r = 44
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <svg viewBox="0 0 120 120" className="size-[120px] -rotate-90">
      {MODES.map((m, i) => {
        const frac = totals[i] / total
        const seg = (
          <circle
            key={m.id}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={m.color}
            strokeWidth="16"
            strokeDasharray={`${frac * c - 2} ${c - frac * c + 2}`}
            strokeDashoffset={-offset * c}
            strokeLinecap="round"
          />
        )
        offset += frac
        return seg
      })}
    </svg>
  )
}

export default function Analytics() {
  const [selectedDay, setSelectedDay] = useState(4)

  const day = USAGE[selectedDay]
  const dayTotal = day.reduce((a, b) => a + b, 0)
  const modeTotals = MODES.map((_, i) => USAGE.reduce((sum, d) => sum + d[i], 0))
  const weekTotal = modeTotals.reduce((a, b) => a + b, 0)
  const maxDay = Math.max(...USAGE.map((d) => d.reduce((a, b) => a + b, 0)))
  const switches = 23

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="使用分析" />

      {/* Weekly summary */}
      <div className="rounded-3xl bg-brand p-5 text-white">
        <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-white/65">
          本週總計
        </p>
        <div className="grid grid-cols-3 gap-3 pt-3">
          <div className="text-center">
            <p className="font-mono text-[20px] font-medium leading-7">{weekTotal}h</p>
            <p className="pt-0.5 text-[12px] text-white/65">使用時長</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[20px] font-medium leading-7">Focus</p>
            <p className="pt-0.5 text-[12px] text-white/65">最常使用</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[20px] font-medium leading-7">{switches} 次</p>
            <p className="pt-0.5 text-[12px] text-white/65">切換次數</p>
          </div>
        </div>
      </div>

      {/* Daily stacked bars */}
      <Card className="p-5">
        <p className="text-[14px] font-bold">每日模式使用（小時）</p>
        <div className="flex gap-1 pt-3">
          {DAYS.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(i)}
              className={`flex-1 rounded-[14px] py-1.5 text-[12px] font-bold ${
                i === selectedDay ? 'bg-brand text-white' : 'text-muted'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex h-[130px] items-end gap-3 pt-4">
          {USAGE.map((d, i) => {
            const total = d.reduce((a, b) => a + b, 0)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(i)}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className="flex w-4 flex-col-reverse overflow-hidden rounded-full"
                  style={{ height: `${(total / maxDay) * 100}px` }}
                >
                  {MODES.map((m, mi) => (
                    <div
                      key={m.id}
                      style={{
                        height: `${(d[mi] / total) * 100}%`,
                        background: m.color,
                        opacity: i === selectedDay ? 1 : 0.45,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted">{DAYS[i]}</span>
              </button>
            )
          })}
        </div>
        {/* Selected day breakdown */}
        <div className="mt-3 rounded-2xl bg-app p-3">
          <p className="text-[12px] font-semibold text-muted">
            星期{DAYS[selectedDay]} · 共 {fmt(dayTotal)}
          </p>
          <div className="flex flex-col gap-1.5 pt-2">
            {MODES.map((m, mi) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: m.color }} />
                <span className="w-14 text-[12px] text-muted">{m.en}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e7e4dc]">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(day[mi] / dayTotal) * 100}%`, background: m.color }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[12px]">{fmt(day[mi])}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Weekly distribution */}
      <Card className="p-5">
        <p className="text-[14px] font-bold">本週模式分佈</p>
        <div className="flex items-center gap-1.5 pt-3">
          <DonutChart totals={modeTotals} total={weekTotal} />
          <div className="flex flex-1 flex-col gap-3 pl-2">
            {MODES.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                <span className="text-[12px] text-muted">{m.name}</span>
                <span className="font-mono text-[12px] font-medium">
                  {modeTotals[i].toFixed(1)}h
                </span>
                <span className="flex-1 text-right text-[12px] text-muted">
                  {Math.round((modeTotals[i] / weekTotal) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
