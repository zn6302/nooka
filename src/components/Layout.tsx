import { NavLink, Outlet } from 'react-router-dom'
import { House, LayoutGrid, ChartNoAxesColumn, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: '首頁', icon: House },
  { to: '/modes', label: '模式', icon: LayoutGrid },
  { to: '/analytics', label: '分析', icon: ChartNoAxesColumn },
  { to: '/settings', label: '設定', icon: Settings },
]

export default function Layout() {
  return (
    <div className="mx-auto flex h-dvh max-w-[420px] flex-col overflow-hidden bg-app sm:my-6 sm:h-[812px] sm:max-h-[calc(100dvh-48px)] sm:rounded-[40px] sm:shadow-[0px_40px_80px_0px_rgba(0,0,0,0.25)]">
      {/* Page content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6">
        <Outlet />
      </div>

      {/* Bottom nav — fixed at the bottom; content scrolls above it */}
      <nav className="flex shrink-0 border-t border-black/[0.06] bg-white pb-6 pt-px">
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
