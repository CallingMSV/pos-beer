import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usePermissionsStore } from '../store/permissionsStore'
import {
  LayoutDashboard, ShoppingCart, Map, ChefHat, Wine, Package,
  Users, CalendarCheck, Archive, Tag, UserCog, BarChart3, LogOut, Beer, Menu, CalendarDays
} from 'lucide-react'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', perm: null },
  { to: '/pos', icon: ShoppingCart, label: 'POS', perm: 'pos' },
  { to: '/floor', icon: Map, label: 'Floor Plan', perm: 'floor' },
  { to: '/products', icon: Package, label: 'เมนู/สินค้า', perm: 'products' },
  { to: '/inventory', icon: Archive, label: 'Inventory', perm: 'inventory' },
  { to: '/customers', icon: Users, label: 'ลูกค้า', perm: 'customers' },
  { to: '/reservations', icon: CalendarCheck, label: 'จอง', perm: 'reservations' },
  { to: '/bottle-keeper', icon: Wine, label: 'Bottle Keeper', perm: 'bottleKeeper' },
  { to: '/promotions', icon: Tag, label: 'โปรโมชัน', perm: 'promotions' },
  { to: '/staff', icon: UserCog, label: 'พนักงาน', perm: 'staff' },
  { to: '/schedule', icon: CalendarDays, label: 'ตารางงาน', perm: null },
  { to: '/reports', icon: BarChart3, label: 'รายงาน', perm: 'reports' },
]

export default function Layout() {
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)
  const { can, fetch } = usePermissionsStore()
  const navigate = useNavigate()

  useEffect(() => { fetch() }, [])
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-card border-r border-border flex flex-col transition-all duration-200`}>
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Beer className="text-primary shrink-0" size={24} />
          {!collapsed && <span className="font-bold text-primary text-lg">Beer POS</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-400 hover:text-white">
            <Menu size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {nav.filter(({ perm }) => !perm || can(user?.role, perm)).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-border'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          {!collapsed && <p className="text-xs text-gray-500 mb-2 truncate">{user?.name}</p>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm w-full px-2 py-1.5 rounded-xl hover:bg-border">
            <LogOut size={16} />
            {!collapsed && 'ออกจากระบบ'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-bg p-6">
        <Outlet />
      </main>
    </div>
  )
}
