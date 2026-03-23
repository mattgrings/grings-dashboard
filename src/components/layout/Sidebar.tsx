import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChartLineUp,
  ChartBar,
  Barbell,
  ListChecks,
  CurrencyDollar,
  CaretLeft,
  CaretRight,
  SignOut,
  Megaphone,
  CalendarCheck,
  ChatText,
  Gear,
  Funnel,
  Users,
  ChatsCircle,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import Logo from '../ui/Logo'

const navItems = [
  { to: '/', icon: ChartLineUp, label: 'Dashboard' },
  { to: '/alunos', icon: Users, label: 'Alunos' },
  { to: '/treinos', icon: Barbell, label: 'Treinos' },
  { to: '/financeiro', icon: CurrencyDollar, label: 'Financeiro' },
  { to: '/tarefas', icon: ListChecks, label: 'Tarefas' },
  { to: '/frequencia', icon: CalendarCheck, label: 'Frequência' },
  { to: '/social', icon: Megaphone, label: 'Social' },
  { to: '/captacoes', icon: Funnel, label: 'Captações' },
  { to: '/relatorios', icon: ChartBar, label: 'Relatórios' },
  { to: '/feedbacks', icon: ChatText, label: 'Feedbacks' },
  { to: '/chat', icon: ChatsCircle, label: 'Chat' },
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
      <div className="flex items-center gap-3 px-4 h-20 border-b border-white/5">
        <Logo size={collapsed ? 'sm' : 'md'} />
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
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
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
                <item.icon
                  size={20}
                  weight={isActive ? 'fill' : 'regular'}
                  className="relative z-10 shrink-0"
                />
                {!collapsed && (
                  <span className="relative z-10 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Separator */}
        <div className="h-px bg-white/5 my-2" />

        {/* Configurações */}
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand-green text-black shadow-glow-green-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Gear
                size={20}
                weight={isActive ? 'fill' : 'regular'}
                className="shrink-0"
              />
              {!collapsed && <span className="whitespace-nowrap">Configurações</span>}
            </>
          )}
        </NavLink>
      </nav>

      {/* User / Collapse */}
      <div className="p-3 border-t border-white/5 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green text-xs font-bold">
              {user?.nome?.slice(0, 2).toUpperCase() ?? 'GT'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {user?.nome ?? 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'admin' ? 'Administrador' : 'Aluno'}
              </p>
            </div>
          </div>
        )}

        {/* Explicit logout button */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <SignOut size={18} />
          {!collapsed && <span>Sair da conta</span>}
        </button>

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
