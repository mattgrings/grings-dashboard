import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ForkKnife,
  CaretDown,
  ArrowsClockwise,
  Info,
  Clipboard,
} from '@phosphor-icons/react'
import { useAlunosStore } from '../../store/alunosStore'
import { useAuthStore } from '../../store/authStore'

const iconesRefeicao: Record<string, string> = {
  'Café da manhã': '☀️',
  'Lanche da manhã': '🍎',
  'Almoço': '🥗',
  'Lanche da tarde': '🥜',
  'Jantar': '🌙',
  'Ceia': '🌿',
  'Pré-treino': '⚡',
  'Pós-treino': '💪',
}

// Tipo para alimentos ricos (novo formato)
interface AlimentoRico {
  id: string
  nome: string
  quantidade: string
  calorias?: number
  substituicoes?: string[]
  observacao?: string
  ordem: number
}

// Tipo para refeição expandida
interface RefeicaoExpandida {
  nome: string
  horario?: string
  observacoes?: string
  icone?: string
  alimentos: (string | AlimentoRico)[]
}

// Converte um alimento string para AlimentoRico para compatibilidade
function normalizeAlimento(item: string | AlimentoRico, index: number): AlimentoRico {
  if (typeof item === 'string') {
    return {
      id: `al-${index}`,
      nome: item,
      quantidade: '',
      ordem: index,
    }
  }
  return item
}

// ══════════════════════════════════════════
// Card de Alimento
// ══════════════════════════════════════════
function AlimentoCard({ alimento }: { alimento: AlimentoRico }) {
  const [mostrarSubstituicoes, setMostrarSubstituicoes] = useState(false)

  return (
    <div className="bg-[#0A0A0A] rounded-xl p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">{alimento.nome}</span>
            {alimento.quantidade && (
              <span className="text-xs text-[#00E620] bg-[#00E620]/10 px-2 py-0.5 rounded-full font-medium">
                {alimento.quantidade}
              </span>
            )}
          </div>
          {alimento.calorias != null && alimento.calorias > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">{alimento.calorias} kcal</p>
          )}
        </div>

        {alimento.substituicoes && alimento.substituicoes.length > 0 && (
          <button
            onClick={() => setMostrarSubstituicoes(!mostrarSubstituicoes)}
            className="flex items-center gap-1 text-xs text-[#00E620] bg-[#00E620]/10
                       px-2.5 py-1.5 rounded-xl touch-manipulation
                       hover:bg-[#00E620]/20 transition-all flex-shrink-0"
          >
            <ArrowsClockwise size={12} />
            {alimento.substituicoes.length} sub.
          </button>
        )}
      </div>

      {/* Observação do alimento */}
      {alimento.observacao && (
        <p className="text-xs text-gray-500 italic flex items-start gap-1.5">
          <Info size={12} className="flex-shrink-0 mt-0.5" />
          {alimento.observacao}
        </p>
      )}

      {/* Substituições */}
      <AnimatePresence>
        {mostrarSubstituicoes && alimento.substituicoes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <ArrowsClockwise size={12} />
                Substituições possíveis:
              </p>
              {alimento.substituicoes.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                             bg-[#111111] border border-white/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E620] flex-shrink-0" />
                  <span className="text-sm text-white">{sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ══════════════════════════════════════════
// AlunoDieta
// ══════════════════════════════════════════
export default function AlunoDieta() {
  const user = useAuthStore((s) => s.user)
  const dietas = useAlunosStore((s) => s.dietas)
  const alunos = useAlunosStore((s) => s.alunos)
  const [refeicaoExpandida, setRefeicaoExpandida] = useState<number | null>(null)

  // Match logged-in user to aluno by name
  const aluno = alunos.find((a) => a.nome === user?.nome)
  const alunoId = aluno?.id ?? 'a1'

  const minhasDietas = dietas
    .filter((d) => d.alunoId === alunoId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const dietaAtual = minhasDietas[0]

  if (!dietaAtual) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <ForkKnife size={22} className="text-[#00E620]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">MINHA DIETA</h1>
            <p className="text-gray-500 text-sm">Seu plano alimentar atual</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 text-center">
          <ForkKnife size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma dieta cadastrada ainda.</p>
          <p className="text-gray-600 text-sm mt-1">Aguarde seu nutricionista montar seu plano.</p>
        </div>
      </div>
    )
  }

  const refeicoes: RefeicaoExpandida[] = dietaAtual.refeicoes.map((r) => ({
    nome: r.nome,
    horario: r.horario,
    observacoes: undefined,
    icone: undefined,
    alimentos: r.alimentos,
  }))

  const totalCalorias = dietaAtual.macros?.calorias ?? 0

  return (
    <div className="space-y-4 pb-20">
      {/* Header gradiente */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 border border-[#00E620]/20"
        style={{
          background: 'linear-gradient(135deg, rgba(0,230,32,0.15), rgba(0,230,32,0.03))',
        }}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-3xl bg-[#00E620]/15" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🥗</span>
            <div>
              <h1 className="text-2xl font-display text-white">{dietaAtual.titulo}</h1>
              <p className="text-gray-500 text-sm">{dietaAtual.descricao}</p>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{totalCalorias || '–'}</p>
              <p className="text-xs text-gray-500">kcal / dia</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{refeicoes.length}</p>
              <p className="text-xs text-gray-500">refeições</p>
            </div>
          </div>

          {/* Observações gerais */}
          {dietaAtual.descricao && (
            <div className="mt-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Clipboard size={12} /> Observações gerais
              </p>
              <p className="text-sm text-white">{dietaAtual.descricao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Refeições — Acordeões */}
      <div className="space-y-3">
        {refeicoes.map((refeicao, ri) => {
          const aberta = refeicaoExpandida === ri
          const alimentosNormalizados = refeicao.alimentos.map((a, i) => normalizeAlimento(a, i))

          return (
            <motion.div
              key={ri}
              layout
              className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5"
            >
              {/* Header da refeição */}
              <button
                onClick={() => setRefeicaoExpandida(aberta ? null : ri)}
                className="w-full flex items-center gap-3 p-4 text-left touch-manipulation"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,230,32,0.2), rgba(0,230,32,0.05))',
                    border: '1px solid rgba(0,230,32,0.2)',
                  }}
                >
                  {refeicao.icone || iconesRefeicao[refeicao.nome] || '🍽️'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{refeicao.nome}</h3>
                    {refeicao.horario && (
                      <span className="text-xs text-gray-500 bg-[#0A0A0A] px-2 py-0.5 rounded-full">
                        🕐 {refeicao.horario}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {refeicao.alimentos.length} alimentos
                  </p>
                </div>

                <motion.div animate={{ rotate: aberta ? 180 : 0 }}>
                  <CaretDown size={20} className="text-gray-500 flex-shrink-0" />
                </motion.div>
              </button>

              {/* Conteúdo expandido */}
              <AnimatePresence>
                {aberta && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
                      {/* Observações da refeição */}
                      {refeicao.observacoes && (
                        <div className="flex gap-2 p-3 rounded-xl bg-[#0A0A0A] border border-white/5">
                          <span className="text-lg flex-shrink-0">💬</span>
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-0.5">
                              Observações da nutricionista
                            </p>
                            <p className="text-sm text-white">{refeicao.observacoes}</p>
                          </div>
                        </div>
                      )}

                      {/* Lista de alimentos */}
                      <div className="space-y-2">
                        {alimentosNormalizados.map((alimento) => (
                          <AlimentoCard key={alimento.id} alimento={alimento} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
