import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  House,
  Barbell,
  ForkKnife,
  ChartLineUp,
  Calculator,
  CalendarCheck,
  SignOut,
  CloudCheck,
  CloudArrowUp,
  CloudSlash,
  Warning,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { useCloudSync } from '../../hooks/useCloudSync'
import type { SyncStatus } from '../../hooks/useCloudSync'

const alunoNavDesktop = [
  { path: '/aluno', icon: House, label: 'Inicio', end: true },
  { path: '/aluno/treino', icon: Barbell, label: 'Treino' },
  { path: '/aluno/dieta', icon: ForkKnife, label: 'Dieta' },
  { path: '/aluno/evolucao', icon: ChartLineUp, label: 'Evolução' },
  { path: '/aluno/frequencia', icon: CalendarCheck, label: 'Frequência' },
  { path: '/aluno/calculadoras', icon: Calculator, label: 'Calc' },
]

const alunoNavMobile: (typeof alunoNavDesktop[number] | null)[] = [
  { path: '/aluno', icon: House, label: 'Início', end: true },
  { path: '/aluno/treino', icon: Barbell, label: 'Treino' },
  null, // FAB
  { path: '/aluno/evolucao', icon: ChartLineUp, label: 'Evolução' },
  { path: '/aluno/frequencia', icon: CalendarCheck, label: 'Freq.' },
]

const syncIcons: Record<SyncStatus, { icon: typeof CloudCheck; color: string; label: string }> = {
  synced: { icon: CloudCheck, color: 'text-[#00E620]', label: 'Sincronizado' },
  syncing: { icon: CloudArrowUp, color: 'text-yellow-400 animate-pulse', label: 'Sincronizando...' },
  offline: { icon: CloudSlash, color: 'text-gray-500', label: 'Offline' },
  error: { icon: Warning, color: 'text-red-400', label: 'Erro de sync' },
}

export default function AlunoLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const { status, forceSync } = useCloudSync()
  const sync = syncIcons[status]
  const SyncIcon = sync.icon

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 md:h-16 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Grings Team" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-display text-lg text-white tracking-wider hidden sm:block">GRINGS TEAM</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={forceSync}
            title={sync.label}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <SyncIcon size={18} className={sync.color} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00E620]/20 flex items-center justify-center text-[#00E620] text-xs font-bold">
              {user?.nome?.slice(0, 2).toUpperCase() ?? 'AL'}
            </div>
            <span className="text-sm text-white font-medium hidden sm:block">{user?.nome ?? 'Aluno'}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <SignOut size={20} />
          </button>
        </div>
      </header>

      {/* Desktop Top Nav */}
      <nav className="hidden md:flex sticky top-16 z-30 bg-[#111111] border-b border-white/5 px-6">
        {alunoNavDesktop.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                isActive
                  ? 'border-[#00E620] text-[#00E620]'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} weight={isActive ? 'fill' : 'regular'} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#111111] border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        {alunoNavMobile.map((item) => {
          if (!item) {
            return (
              <div key="fab" className="relative flex-1 flex items-center justify-center">
                <NavLink
                  to="/aluno/dieta"
                  className="absolute -top-5 w-12 h-12 rounded-full bg-[#00E620] flex items-center justify-center shadow-[0_0_20px_rgba(0,230,32,0.4)] active:scale-90 transition-transform touch-manipulation"
                >
                  <ForkKnife size={24} weight="bold" className="text-black" />
                </NavLink>
              </div>
            )
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `relative flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-medium transition-all touch-manipulation ${
                  isActive ? 'text-[#00E620]' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="aluno-bottom-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00E620] rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
