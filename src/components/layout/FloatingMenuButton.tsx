import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  List,
  X,
  House,
  Barbell,
  CurrencyDollar,
  ListChecks,
  CalendarCheck,
  Megaphone,
  Funnel,
  ChartBar,
  ChatText,
  Gear,
  SignOut,
  ForkKnife,
  ChartLineUp,
  Calculator,
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import Logo from '../ui/Logo'

const adminNav = [
  { path: '/', icon: House, label: 'Dashboard', end: true },
  { path: '/alunos', icon: Barbell, label: 'Alunos' },
  { path: '/financeiro', icon: CurrencyDollar, label: 'Financeiro' },
  { path: '/tarefas', icon: ListChecks, label: 'Tarefas' },
  { path: '/frequencia', icon: CalendarCheck, label: 'Frequência' },
  { path: '/social', icon: Megaphone, label: 'Social Selling' },
  { path: '/captacoes', icon: Funnel, label: 'Captações' },
  { path: '/relatorios', icon: ChartBar, label: 'Relatórios' },
  { path: '/feedbacks', icon: ChatText, label: 'Feedbacks' },
  { path: '/configuracoes', icon: Gear, label: 'Configurações' },
]

const alunoNav = [
  { path: '/aluno', icon: House, label: 'Início', end: true },
  { path: '/aluno/treino', icon: Barbell, label: 'Treino' },
  { path: '/aluno/dieta', icon: ForkKnife, label: 'Dieta' },
  { path: '/aluno/evolucao', icon: ChartLineUp, label: 'Evolução' },
  { path: '/aluno/frequencia', icon: CalendarCheck, label: 'Frequência' },
  { path: '/aluno/calculadoras', icon: Calculator, label: 'Calculadoras' },
  { path: '/aluno/feedback', icon: ChatText, label: 'Feedback' },
]

export default function FloatingMenuButton() {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const isAluno = user?.role === 'aluno'
  const navItems = isAluno ? alunoNav : adminNav

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-[calc(1rem+var(--sab,0px))] right-4 z-[70] w-14 h-14 rounded-full bg-[#00E620] text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,230,32,0.5)] md:hidden touch-manipulation"
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {open ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
      </motion.button>

      {/* Full-screen menu overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-4 bottom-[calc(5rem+var(--sab,0px))] z-[68] md:hidden max-h-[70vh] overflow-y-auto rounded-2xl bg-[#141414] border border-white/10 shadow-[0_0_60px_rgba(0,230,32,0.15)]"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Logo size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {user?.nome ?? 'Usuário'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {isAluno ? 'Aluno' : 'Administrador'}
                  </p>
                </div>
              </div>

              {/* Nav Items */}
              <div className="p-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#00E620] text-black'
                          : 'text-gray-300 hover:bg-white/5 active:bg-white/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={20}
                          weight={isActive ? 'fill' : 'regular'}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Logout */}
              <div className="p-3 pt-0 border-t border-white/5 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 active:bg-red-400/20 transition-all mt-2"
                >
                  <SignOut size={20} />
                  <span>Sair da conta</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
