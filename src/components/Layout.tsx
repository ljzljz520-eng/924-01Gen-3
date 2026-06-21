import { NavLink, Outlet } from 'react-router-dom'
import { UtensilsCrossed, Eye, Printer } from 'lucide-react'

const navItems = [
  { to: '/menu-editor', label: '菜品管理', icon: UtensilsCrossed },
  { to: '/menu-preview', label: '菜单预览', icon: Eye },
  { to: '/print-preview', label: '打印导出', icon: Printer },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-cream">
      <aside className="w-64 flex-shrink-0 bg-brand-black text-white flex flex-col">
        <div className="px-6 py-8 border-b border-white/10">
          <h1 className="font-serif text-xl font-bold tracking-wide">
            <span className="text-brand-red">味</span>道设计
          </h1>
          <p className="text-xs text-white/50 mt-1">餐饮菜单设计器</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-red text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-[10px] text-white/30">数据自动保存至本地</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
