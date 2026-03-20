import { motion } from 'framer-motion'
import { Barbell } from '@phosphor-icons/react'
import { useAlunosStore } from '../../store/alunosStore'
import { useAuthStore } from '../../store/authStore'

export default function AlunoTreino() {
  const user = useAuthStore((s) => s.user)
  const treinos = useAlunosStore((s) => s.treinos)
  const alunos = useAlunosStore((s) => s.alunos)

  // Match logged-in user to aluno by name
  const aluno = alunos.find((a) => a.nome === user?.nome)
  const alunoId = aluno?.id ?? 'a1' // fallback to Ana Beatriz for demo

  const meusTreinos = treinos
    .filter((t) => t.alunoId === alunoId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const treinoAtual = meusTreinos[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <Barbell size={22} className="text-[#00E620]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">TREINO DO DIA</h1>
            <p className="text-gray-500 text-sm">Seu plano de treino atual</p>
          </div>
        </div>
      </motion.div>

      {!treinoAtual ? (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center">
          <Barbell size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum treino cadastrado ainda.</p>
          <p className="text-gray-600 text-sm mt-1">Aguarde seu treinador montar seu plano.</p>
        </div>
      ) : (
        <>
          {/* Treino Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] border border-white/5 rounded-2xl p-5"
          >
            <h2 className="text-white font-semibold text-lg">{treinoAtual.titulo}</h2>
            <p className="text-gray-400 text-sm mt-1">{treinoAtual.descricao}</p>
            <p className="text-xs text-gray-600 mt-2">
              Atualizado em {new Date(treinoAtual.data).toLocaleDateString('pt-BR')}
            </p>
          </motion.div>

          {/* Exercise Groups */}
          {treinoAtual.detalhes.map((grupo, gi) => (
            <motion.div
              key={gi}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + gi * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-[#00E620] font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E620]" />
                {grupo.nome}
              </h3>

              <div className="space-y-2">
                {grupo.exercicios.map((ex, ei) => (
                  <motion.div
                    key={ei}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + gi * 0.1 + ei * 0.05 }}
                    className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-[#00E620]/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{ex.nome}</p>
                        {ex.observacao && (
                          <p className="text-yellow-500/70 text-xs mt-1">{ex.observacao}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm shrink-0 ml-4">
                        <span className="text-gray-400">
                          <span className="text-[#00E620] font-semibold">{ex.series}</span> x{' '}
                          <span className="text-white font-medium">{ex.repeticoes}</span>
                        </span>
                        {ex.carga && (
                          <span className="text-xs bg-[#00E620]/10 text-[#00E620] px-2 py-0.5 rounded-lg font-medium">
                            {ex.carga}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Previous Treinos */}
          {meusTreinos.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-[#111111] border border-white/5 rounded-2xl p-5"
            >
              <h3 className="text-white font-semibold mb-3">Treinos Anteriores</h3>
              <div className="space-y-2">
                {meusTreinos.slice(1).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-gray-300 text-sm">{t.titulo}</p>
                      <p className="text-gray-600 text-xs">{t.descricao}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
