import { motion } from 'framer-motion'
import { Barbell, ForkKnife, TrendUp, CalendarCheck, Trophy } from '@phosphor-icons/react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
}

export default function AlunoDashboard() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.nome?.split(' ')[0] ?? 'Aluno'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-display text-white tracking-wider">
          Ola, {firstName}!
        </h1>
        <p className="text-gray-400 text-sm mt-1">Confira seu painel de acompanhamento</p>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#111111] border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
              <Trophy size={22} className="text-[#00E620]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Plano</p>
              <p className="text-white font-semibold">Premium</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Consultoria completa com treino + dieta</p>
        </motion.div>

        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#111111] border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
              <CalendarCheck size={22} className="text-[#00E620]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Vencimento</p>
              <p className="text-white font-semibold">15/04/2026</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">26 dias restantes</p>
        </motion.div>

        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#111111] border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
              <TrendUp size={22} className="text-[#00E620]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Progresso</p>
              <p className="text-white font-semibold">-3.5 kg</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Peso: 68.5 kg</span>
            <span>IMC: 25.2</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NavLink to="/aluno/treino">
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-[#00E620]/30 transition-colors cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00E620]/10 flex items-center justify-center group-hover:bg-[#00E620]/20 transition-colors">
              <Barbell size={28} className="text-[#00E620]" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Meu Treino</h3>
              <p className="text-gray-500 text-sm">Ver treino do dia</p>
            </div>
          </motion.div>
        </NavLink>

        <NavLink to="/aluno/dieta">
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-[#00E620]/30 transition-colors cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00E620]/10 flex items-center justify-center group-hover:bg-[#00E620]/20 transition-colors">
              <ForkKnife size={28} className="text-[#00E620]" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Minha Dieta</h3>
              <p className="text-gray-500 text-sm">Ver plano alimentar</p>
            </div>
          </motion.div>
        </NavLink>
      </div>

      {/* Mini Progress */}
      <motion.div
        custom={5}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#111111] border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-white font-semibold mb-4">Resumo do Progresso</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Peso Atual', value: '68.5 kg', color: 'text-[#00E620]' },
            { label: 'Peso Inicial', value: '72.0 kg', color: 'text-gray-300' },
            { label: 'IMC', value: '25.2', color: 'text-[#00E620]' },
            { label: 'Meta', value: '64.0 kg', color: 'text-gray-300' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso para a meta</span>
            <span>44%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '44%' }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#00E620] to-[#00CC00] rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
