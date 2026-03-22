import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  House,
  Users,
  CurrencyDollar,
  ListChecks,
  Plus,
} from '@phosphor-icons/react'

const navItems = [
  { path: '/', icon: House, label: 'Início' },
  { path: '/alunos', icon: Users, label: 'Alunos' },
  null, // FAB slot
  { path: '/financeiro', icon: CurrencyDollar, label: 'Financeiro' },
  { path: '/tarefas', icon: ListChecks, label: 'Tarefas' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#111111] border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        if (!item) {
          return (
            <div
              key="fab"
              className="relative flex-1 flex items-center justify-center"
            >
              <div className="absolute -top-5 w-12 h-12 rounded-full bg-[#00E620] flex items-center justify-center shadow-[0_0_20px_rgba(0,230,32,0.4)]">
                <Plus size={24} weight="bold" className="text-black" />
              </div>
            </div>
          )
        }

        return (
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
                <item.icon
                  size={22}
                  weight={isActive ? 'fill' : 'regular'}
                />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="admin-bottom-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#00E620] rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
