import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  House,
  Barbell,
  ChartLineUp,
  CalendarCheck,
  ChatText,
  SignOut,
  CloudCheck,
  CloudArrowUp,
  CloudSlash,
  Warning,
  ForkKnife,
  Calculator,
  ChatsCircle,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { useCloudSync } from '../../hooks/useCloudSync'
import type { SyncStatus } from '../../hooks/useCloudSync'
import Logo from '../ui/Logo'
import GreenLedBackground from '../ui/GreenLedBackground'
import FloatingMenuButton from './FloatingMenuButton'

const alunoNavDesktop = [
  { path: '/aluno', icon: House, label: 'Inicio', end: true },
  { path: '/aluno/treino', icon: Barbell, label: 'Treino' },
  { path: '/aluno/dieta', icon: ForkKnife, label: 'Dieta' },
  { path: '/aluno/evolucao', icon: ChartLineUp, label: 'Evolução' },
  { path: '/aluno/frequencia', icon: CalendarCheck, label: 'Frequência' },
  { path: '/aluno/calculadoras', icon: Calculator, label: 'Calc' },
  { path: '/aluno/feedback', icon: ChatText, label: 'Feedback' },
  { path: '/aluno/chat', icon: ChatsCircle, label: 'Chat' },
]

const syncIcons: Record<
  SyncStatus,
  { icon: typeof CloudCheck; color: string; label: string }
> = {
  synced: {
    icon: CloudCheck,
    color: 'text-[#00E620]',
    label: 'Sincronizado',
  },
  syncing: {
    icon: CloudArrowUp,
    color: 'text-yellow-400 animate-pulse',
    label: 'Sincronizando...',
  },
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
    <div className="min-h-[100dvh] bg-[#0A0A0A] relative" style={{ paddingTop: 'var(--sat, 0px)' }}>
      <GreenLedBackground />

      {/* Header */}
      <header className="sticky top-0 z-40 h-14 md:h-16 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 relative">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-display text-lg text-white tracking-wider hidden sm:block">
            GRINGS TEAM
          </span>
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
            <span className="text-sm text-white font-medium hidden sm:block">
              {user?.nome ?? 'Aluno'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors hidden md:flex"
          >
            <SignOut size={20} />
          </button>
        </div>
      </header>

      {/* Desktop Top Nav */}
      <nav className="hidden md:flex sticky top-16 z-30 bg-[#111111]/80 backdrop-blur-xl border-b border-white/5 px-6 relative">
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
      <main className="p-4 md:p-6 pb-28 md:pb-6 relative z-10">
        <Outlet />
      </main>

      {/* Floating Menu Button - mobile only */}
      <FloatingMenuButton />
    </div>
  )
}
