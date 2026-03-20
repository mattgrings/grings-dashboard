import { motion } from 'framer-motion'
import { ForkKnife, Clock, Fire } from '@phosphor-icons/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useAlunosStore } from '../../store/alunosStore'
import { useAuthStore } from '../../store/authStore'

const MACRO_COLORS = ['#00E620', '#3B82F6', '#F59E0B', '#EF4444']

export default function AlunoDieta() {
  const user = useAuthStore((s) => s.user)
  const dietas = useAlunosStore((s) => s.dietas)
  const alunos = useAlunosStore((s) => s.alunos)

  // Match logged-in user to aluno by name
  const aluno = alunos.find((a) => a.nome === user?.nome)
  const alunoId = aluno?.id ?? 'a1' // fallback for demo

  const minhasDietas = dietas
    .filter((d) => d.alunoId === alunoId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const dietaAtual = minhasDietas[0]

  const macroData = dietaAtual?.macros
    ? [
        { name: 'Proteina', value: dietaAtual.macros.proteina, unit: 'g' },
        { name: 'Carboidrato', value: dietaAtual.macros.carboidrato, unit: 'g' },
        { name: 'Gordura', value: dietaAtual.macros.gordura, unit: 'g' },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <ForkKnife size={22} className="text-[#00E620]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">MINHA DIETA</h1>
            <p className="text-gray-500 text-sm">Seu plano alimentar atual</p>
          </div>
        </div>
      </motion.div>

      {!dietaAtual ? (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center">
          <ForkKnife size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma dieta cadastrada ainda.</p>
          <p className="text-gray-600 text-sm mt-1">Aguarde seu nutricionista montar seu plano.</p>
        </div>
      ) : (
        <>
          {/* Diet Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] border border-white/5 rounded-2xl p-5"
          >
            <h2 className="text-white font-semibold text-lg">{dietaAtual.titulo}</h2>
            <p className="text-gray-400 text-sm mt-1">{dietaAtual.descricao}</p>
            <p className="text-xs text-gray-600 mt-2">
              Atualizado em {new Date(dietaAtual.data).toLocaleDateString('pt-BR')}
            </p>
          </motion.div>

          {/* Macros Summary */}
          {dietaAtual.macros && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#111111] border border-white/5 rounded-2xl p-5"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Fire size={18} className="text-[#00E620]" />
                Macros do Dia
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Donut Chart */}
                <div className="w-40 h-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {macroData.map((_, index) => (
                          <Cell key={index} fill={MACRO_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(value: number, name: string) => [`${value}g`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Macro Values */}
                <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-[#00E620]">{dietaAtual.macros.calorias}</p>
                    <p className="text-xs text-gray-500">Calorias (kcal)</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-[#00E620]">{dietaAtual.macros.proteina}g</p>
                    <p className="text-xs text-gray-500">Proteina</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-[#3B82F6]">{dietaAtual.macros.carboidrato}g</p>
                    <p className="text-xs text-gray-500">Carboidrato</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl font-bold text-[#F59E0B]">{dietaAtual.macros.gordura}g</p>
                    <p className="text-xs text-gray-500">Gordura</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Meals */}
          <div className="space-y-3">
            {dietaAtual.refeicoes.map((refeicao, ri) => (
              <motion.div
                key={ri}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + ri * 0.08 }}
                className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-[#00E620]/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{refeicao.nome}</h4>
                  {refeicao.horario && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {refeicao.horario}
                    </span>
                  )}
                </div>
                <ul className="space-y-1">
                  {refeicao.alimentos.map((alimento, ai) => (
                    <li key={ai} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-[#00E620] mt-1.5 w-1 h-1 rounded-full bg-[#00E620] shrink-0" />
                      {alimento}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
