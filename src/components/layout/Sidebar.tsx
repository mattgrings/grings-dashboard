import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChartLineUp,
  UserPlus,
  Phone,
  CalendarBlank,
  ChartBar,
  Barbell,
  ListChecks,
  CurrencyDollar,
  CaretLeft,
  CaretRight,
  SignOut,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/', icon: ChartLineUp, label: 'Dashboard' },
  { to: '/captacoes', icon: UserPlus, label: 'Captações' },
  { to: '/chamadas', icon: Phone, label: 'Chamadas' },
  { to: '/agenda', icon: CalendarBlank, label: 'Agenda' },
  { to: '/alunos', icon: Barbell, label: 'Alunos' },
  { to: '/tarefas', icon: ListChecks, label: 'Tarefas' },
  { to: '/financeiro', icon: CurrencyDollar, label: 'Financeiro' },
  { to: '/relatorios', icon: ChartBar, label: 'Relatórios' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex fixed top-0 left-0 h-screen bg-bg-sidebar border-r border-white/5 flex-col z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <img src="/logo.png" alt="Grings Team" className="w-9 h-9 rounded-lg object-contain" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-xl text-white tracking-wider"
          >
            GRINGS TEAM
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? 'bg-brand-green text-black shadow-glow-green-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {!isActive && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-0 bg-brand-green/10 rounded-xl"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <item.icon size={20} weight={isActive ? 'fill' : 'regular'} className="relative z-10 shrink-0" />
                {!collapsed && (
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Collapse */}
      <div className="p-3 border-t border-white/5 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green text-xs font-bold">
              {user?.nome?.slice(0, 2).toUpperCase() ?? 'GT'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user?.nome ?? 'Usuário'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role === 'admin' ? 'Administrador' : 'Aluno'}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <SignOut size={18} />
            </button>
          </div>
        )}
        {collapsed && (
          <button
            onClick={logout}
            title="Sair"
            className="w-full flex items-center justify-center px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <SignOut size={16} />
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
        >
          {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </motion.aside>
  )
}
