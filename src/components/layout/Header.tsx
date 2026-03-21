import { useLocation } from 'react-router-dom'
import { Bell, MagnifyingGlass, CloudCheck, CloudArrowUp, CloudSlash, Warning } from '@phosphor-icons/react'
import { useCloudSync } from '../../hooks/useCloudSync'
import type { SyncStatus } from '../../hooks/useCloudSync'

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/captacoes': 'Captações',
  '/chamadas': 'Chamadas',
  '/agenda': 'Agenda',
  '/alunos': 'Alunos',
  '/frequencia': 'Frequência',
  '/tarefas': 'Tarefas',
  '/financeiro': 'Financeiro',
  '/social': 'Social Selling',
  '/relatorios': 'Relatórios',
}

const syncConfig: Record<SyncStatus, { icon: typeof CloudCheck; color: string; label: string }> = {
  synced: { icon: CloudCheck, color: 'text-[#00E620]', label: 'Sincronizado' },
  syncing: { icon: CloudArrowUp, color: 'text-yellow-400 animate-pulse', label: 'Sincronizando...' },
  offline: { icon: CloudSlash, color: 'text-gray-500', label: 'Offline' },
  error: { icon: Warning, color: 'text-red-400', label: 'Erro de sync' },
}

export default function Header() {
  const { pathname } = useLocation()
  const title = pageNames[pathname] || (pathname.startsWith('/alunos/') ? 'Perfil do Aluno' : 'Dashboard')
  const { status, forceSync } = useCloudSync()
  const sync = syncConfig[status]
  const SyncIcon = sync.icon

  return (
    <header className="h-14 md:h-16 border-b border-white/5 bg-bg/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <h1 className="text-lg md:text-xl font-display tracking-wider text-white">{title.toUpperCase()}</h1>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search - hidden on small mobile */}
        <div className="relative hidden sm:block">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 focus:shadow-glow-green-sm transition-all w-48 focus:w-64"
          />
        </div>

        {/* Search icon on mobile */}
        <button className="sm:hidden relative p-2.5 rounded-xl bg-surface border border-white/5 text-gray-400 hover:text-white hover:border-white/10 transition-colors touch-manipulation">
          <MagnifyingGlass size={18} />
        </button>

        {/* Sync status */}
        <button
          onClick={forceSync}
          title={sync.label}
          className="relative p-2.5 rounded-xl bg-surface border border-white/5 hover:border-white/10 transition-colors touch-manipulation"
        >
          <SyncIcon size={18} className={sync.color} />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-surface border border-white/5 text-gray-400 hover:text-white hover:border-white/10 transition-colors touch-manipulation">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-green rounded-full" />
        </button>
      </div>
    </header>
  )
}
