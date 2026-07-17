import { useEffect, useReducer, useState } from 'react'
import type { Mode } from '../modes'
import { useApp } from '../store'
import { Card, PageHeader } from '../components/ui'

const DAYS = ['一', '二', '三', '四', '五', '六', '日']

// JS getDay(): Sun=0..Sat=6  →  our week is Mon-first, so Mon=0..Sun=6
const todayIndex = () => (new Date().getDay() + 6) % 7

// ms → hours
const toHours = (ms: number) => ms / 3_600_000

// Compact duration label: hours once past 1h, otherwise minutes
const fmt = (h: number) => {
  if (h >= 1) return `${h.toFixed(1)}h`
  const mins = Math.round(h * 60)
  return `${mins} 分`
}

function DonutChart({ modes, totals, total }: { modes: Mode[]; totals: number[]; total: number }) {
  const r = 44
  const c = 2 * Math.PI * r
  let offset = 0
  if (total <= 0) {
    return (
      <svg viewBox="0 0 120 120" className="size-[120px] -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#eae8e1" strokeWidth="16" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 120 120" className="size-[120px] -rotate-90">
      {modes.map((m, i) => {
        const frac = totals[i] / total
        if (frac <= 0) return null
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
  const { modes, getUsage, switchCount } = useApp()

  // Refresh every 30s so the live time in the current mode keeps ticking up
  const [, tick] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const today = todayIndex()
  const [selectedDay, setSelectedDay] = useState(today)

  // Real usage (hours) for today, keyed by mode order in `modes`
  const usage = getUsage()
  const todayHours = modes.map((m) => toHours(usage[m.id]))

  // Week view: today holds real data, other days are empty for now
  const week: number[][] = DAYS.map((_, i) => (i === today ? todayHours : modes.map(() => 0)))

  const day = week[selectedDay]
  const dayTotal = day.reduce((a, b) => a + b, 0)
  const modeTotals = modes.map((_, i) => week.reduce((sum, d) => sum + d[i], 0))
  const weekTotal = modeTotals.reduce((a, b) => a + b, 0)
  const maxDay = Math.max(1e-9, ...week.map((d) => d.reduce((a, b) => a + b, 0)))

  const topIdx = modeTotals.reduce((best, v, i) => (v > modeTotals[best] ? i : best), 0)
  const topMode = weekTotal > 0 ? modes[topIdx] : null

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
            <p className="font-mono text-[20px] font-medium leading-7">{fmt(weekTotal)}</p>
            <p className="pt-0.5 text-[12px] text-white/65">使用時長</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[20px] font-medium leading-7">{topMode ? topMode.en : '—'}</p>
            <p className="pt-0.5 text-[12px] text-white/65">最常使用</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[20px] font-medium leading-7">{switchCount} 次</p>
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
          {week.map((d, i) => {
            const total = d.reduce((a, b) => a + b, 0)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(i)}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className="flex w-4 flex-col-reverse overflow-hidden rounded-full bg-[#f0eee9]"
                  style={{ height: `${Math.max(4, (total / maxDay) * 100)}px` }}
                >
                  {total > 0 &&
                    modes.map((m, mi) => (
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
            星期{DAYS[selectedDay]}
            {selectedDay === today && ' (今日)'} · 共 {fmt(dayTotal)}
          </p>
          {dayTotal <= 0 ? (
            <p className="pt-2 text-[12px] text-muted">尚無使用紀錄</p>
          ) : (
            <div className="flex flex-col gap-1.5 pt-2">
              {modes.map((m, mi) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: m.color }} />
                  <span className="w-14 text-[12px] text-muted">{m.en}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e7e4dc]">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(day[mi] / dayTotal) * 100}%`, background: m.color }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[12px]">{fmt(day[mi])}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Weekly distribution */}
      <Card className="p-5">
        <p className="text-[14px] font-bold">本週模式分佈</p>
        <div className="flex items-center gap-1.5 pt-3">
          <DonutChart modes={modes} totals={modeTotals} total={weekTotal} />
          <div className="flex flex-1 flex-col gap-3 pl-2">
            {modes.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: m.color }} />
                <span className="text-[12px] text-muted">{m.name}</span>
                <span className="font-mono text-[12px] font-medium">{fmt(modeTotals[i])}</span>
                <span className="flex-1 text-right text-[12px] text-muted">
                  {weekTotal > 0 ? Math.round((modeTotals[i] / weekTotal) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
