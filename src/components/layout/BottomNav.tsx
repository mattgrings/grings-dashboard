import { NavLink } from 'react-router-dom'
import { House, Users, CurrencyDollar, ListChecks, CalendarBlank } from '@phosphor-icons/react'

const navItems = [
  { path: '/', icon: House, label: 'Home' },
  { path: '/alunos', icon: Users, label: 'Alunos' },
  { path: '/tarefas', icon: ListChecks, label: 'Tarefas' },
  { path: '/financeiro', icon: CurrencyDollar, label: 'Financeiro' },
  { path: '/agenda', icon: CalendarBlank, label: 'Agenda' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#111111] border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00E620] rounded-full" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
