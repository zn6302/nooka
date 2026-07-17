import { NavLink, Outlet } from 'react-router-dom'
import { House, LayoutGrid, ChartNoAxesColumn, Settings } from 'lucide-react'
import { Wifi, BatteryFull } from 'lucide-react'

const tabs = [
  { to: '/', label: '首頁', icon: House },
  { to: '/modes', label: '模式', icon: LayoutGrid },
  { to: '/analytics', label: '分析', icon: ChartNoAxesColumn },
  { to: '/settings', label: '設定', icon: Settings },
]

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[420px] flex-col bg-app sm:my-6 sm:min-h-[812px] sm:max-h-[860px] sm:overflow-hidden sm:rounded-[40px] sm:shadow-[0px_40px_80px_0px_rgba(0,0,0,0.25)]">
      {/* Status bar */}
      <div className="flex items-center justify-between px-7 pt-6 pb-2">
        <span className="font-mono text-[13px] font-medium">10:30</span>
        <div className="flex items-center gap-2 text-ink">
          <Wifi size={14} strokeWidth={2.5} />
          <BatteryFull size={17} strokeWidth={2} />
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6">
        <Outlet />
      </div>

      {/* Bottom nav */}
      <nav className="flex border-t border-black/[0.06] bg-white pb-6 pt-px">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex flex-1 flex-col items-center gap-1 pt-3"
          >
            {({ isActive }) => (
              <>
                <Icon size={21} className={isActive ? 'text-brand' : 'text-faint'} />
                <span
                  className={`text-[12px] font-bold ${isActive ? 'text-brand' : 'text-faint'}`}
                >
                  {label}
                </span>
                {isActive && <span className="size-1 rounded-full bg-brand" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
