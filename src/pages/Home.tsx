import { CircleCheck, Sparkles, X } from 'lucide-react'
import { MODES } from '../modes'
import { useApp } from '../store'
import { PageHeader } from '../components/ui'

export default function Home() {
  const { modeId, setModeId, suggestionDismissed, dismissSuggestion } = useApp()

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="智慧屏風"
        desc="選擇目前工作情境，系統將自動調整透明度、燈光與隔音設定。"
      />

      <div className="flex flex-col gap-3">
        {MODES.map((mode) => {
          const active = mode.id === modeId
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setModeId(mode.id)}
              className="w-full rounded-3xl text-left transition-transform active:scale-[0.98]"
              style={active ? { background: mode.color } : { background: '#fff' }}
            >
              <div className="flex items-center gap-4 p-4">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: active ? 'rgba(255,255,255,0.2)' : mode.soft }}
                >
                  <Icon size={22} color={active ? '#fff' : mode.color} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[14px] font-bold ${active ? 'text-white' : 'text-ink'}`}
                    >
                      {mode.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[12px] font-semibold"
                      style={
                        active
                          ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                          : { background: mode.soft, color: mode.chipTextColor }
                      }
                    >
                      {mode.en}
                    </span>
                  </div>
                  <p
                    className={`pt-0.5 text-[12px] font-semibold leading-[1.4] ${
                      active ? 'text-white/75' : 'text-muted'
                    }`}
                  >
                    {mode.desc}
                  </p>
                </div>
                {active && <CircleCheck size={20} color="#fff" className="shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      {!suggestionDismissed && (
        <div className="rounded-3xl bg-ink p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-[10px] bg-[rgba(107,171,138,0.25)]">
                <Sparkles size={15} color="#6bab8a" />
              </div>
              <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6bab8a]">
                AI 智慧建議
              </span>
            </div>
            <button type="button" onClick={dismissSuggestion} aria-label="關閉建議">
              <X size={16} className="text-white/60" />
            </button>
          </div>
          <p className="pt-2 text-[14px] font-semibold">你已連續工作 60 分鐘</p>
          <p className="pt-1 text-[12px] leading-[1.6] text-white/60">
            目前建議切換至 Recovery Mode，適度休息有助恢復專注力，避免過度疲勞干擾工作效率。
          </p>
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => {
                setModeId('recovery')
                dismissSuggestion()
              }}
              className="flex-1 rounded-[14px] bg-brand py-2 text-[12px] font-bold"
            >
              立即切換
            </button>
            <button
              type="button"
              onClick={dismissSuggestion}
              className="flex-1 rounded-[14px] bg-white/10 py-2 text-[12px] font-bold text-white/80"
            >
              稍後提醒
            </button>
            <button
              type="button"
              onClick={dismissSuggestion}
              className="flex-1 rounded-[14px] bg-white/[0.07] py-2 text-[12px] font-bold text-white/50"
            >
              維持現狀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
