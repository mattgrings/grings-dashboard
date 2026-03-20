import { motion } from 'framer-motion'
import { Camera, ChartLineUp, ArrowsOutSimple } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAlunosStore } from '../../store/alunosStore'
import { useAuthStore } from '../../store/authStore'

const mockWeightData = [
  { semana: 'Sem 1', peso: 72.0 },
  { semana: 'Sem 2', peso: 71.5 },
  { semana: 'Sem 3', peso: 71.0 },
  { semana: 'Sem 4', peso: 70.8 },
  { semana: 'Sem 5', peso: 70.2 },
  { semana: 'Sem 6', peso: 69.8 },
  { semana: 'Sem 7', peso: 69.3 },
  { semana: 'Sem 8', peso: 69.0 },
  { semana: 'Sem 9', peso: 68.7 },
  { semana: 'Sem 10', peso: 68.5 },
]

const tipoLabels: Record<string, string> = {
  frente: 'Frente',
  costas: 'Costas',
  lateral: 'Lateral',
  outro: 'Outro',
}

export default function AlunoEvolucao() {
  const user = useAuthStore((s) => s.user)
  const fotos = useAlunosStore((s) => s.fotos)
  const alunos = useAlunosStore((s) => s.alunos)

  // Match logged-in user to aluno by name
  const aluno = alunos.find((a) => a.nome === user?.nome)
  const alunoId = aluno?.id ?? 'a1' // fallback for demo

  const minhasFotos = fotos
    .filter((f) => f.alunoId === alunoId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <ChartLineUp size={22} className="text-[#00E620]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">MINHA EVOLUCAO</h1>
            <p className="text-gray-500 text-sm">Acompanhe seu progresso</p>
          </div>
        </div>
      </motion.div>

      {/* Weight Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111111] border border-white/5 rounded-2xl p-5"
      >
        <h3 className="text-white font-semibold mb-4">Peso ao Longo do Tempo</h3>
        <div className="h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockWeightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="semana"
                stroke="#666"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#666"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}kg`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value} kg`, 'Peso']}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#00E620"
                strokeWidth={2}
                dot={{ fill: '#00E620', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#00E620', stroke: '#0A0A0A', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Compare Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00E620]/10 border border-[#00E620]/20 text-[#00E620] font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#00E620]/20 transition-colors"
      >
        <ArrowsOutSimple size={18} />
        Comparar Fotos
      </motion.button>

      {/* Progress Photos */}
      <div>
        <h3 className="text-white font-semibold mb-4">Fotos de Progresso</h3>

        {minhasFotos.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center">
            <Camera size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma foto de progresso ainda.</p>
            <p className="text-gray-600 text-sm mt-1">Seu treinador adicionara suas fotos aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {minhasFotos.map((foto, i) => (
              <motion.div
                key={foto.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden hover:border-[#00E620]/20 transition-colors group"
              >
                {/* Placeholder image */}
                <div className="aspect-[3/4] bg-gradient-to-br from-[#00E620]/5 to-[#00E620]/10 flex items-center justify-center relative">
                  <Camera size={32} className="text-[#00E620]/30" />
                  <div className="absolute top-2 right-2 text-[10px] bg-[#00E620]/20 text-[#00E620] px-2 py-0.5 rounded-full font-medium">
                    {tipoLabels[foto.tipo] ?? foto.tipo}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-medium truncate">{foto.legenda ?? 'Sem legenda'}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">
                    {new Date(foto.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
