import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChatText,
  Star,
  Eye,
  Trash,
  FunnelSimple,
} from '@phosphor-icons/react'
import { useFeedbackStore } from '../store/feedbackStore'
import type { Feedback } from '../store/feedbackStore'
import EmptyState from '../components/ui/EmptyState'

const emojis = ['', '😴', '😕', '🙂', '💪', '🔥']
const sensacaoLabels = ['', 'Muito difícil', 'Difícil', 'Boa', 'Ótima', 'Incrível']

const tipoLabels: Record<Feedback['tipo'], string> = {
  pos_treino: 'Pós-treino',
  geral: 'Geral',
  sugestao: 'Sugestão',
  dificuldade: 'Dificuldade',
}

export default function Feedbacks() {
  const feedbacks = useFeedbackStore((s) => s.feedbacks)
  const marcarLido = useFeedbackStore((s) => s.marcarLido)
  const marcarTodosLidos = useFeedbackStore((s) => s.marcarTodosLidos)
  const deleteFeedback = useFeedbackStore((s) => s.deleteFeedback)
  const [filtro, setFiltro] = useState<'todos' | 'nao_lidos'>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)

  const filtered =
    filtro === 'nao_lidos'
      ? feedbacks.filter((f) => !f.lido)
      : feedbacks

  const naoLidos = feedbacks.filter((f) => !f.lido).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChatText size={24} className="text-[#00E620]" />
            Feedbacks dos Alunos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {feedbacks.length} feedbacks · {naoLidos} não lidos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {naoLidos > 0 && (
            <button
              onClick={marcarTodosLidos}
              className="px-3 py-2 text-xs bg-[#00E620]/10 text-[#00E620] rounded-lg
                         hover:bg-[#00E620]/20 transition-colors"
            >
              Marcar todos como lidos
            </button>
          )}
          <div className="flex bg-[#141414] rounded-lg border border-white/5 p-0.5">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                filtro === 'todos'
                  ? 'bg-[#00E620]/10 text-[#00E620]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('nao_lidos')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1 ${
                filtro === 'nao_lidos'
                  ? 'bg-[#00E620]/10 text-[#00E620]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FunnelSimple size={12} />
              Não lidos
              {naoLidos > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                  {naoLidos}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ChatText}
          titulo="Nenhum feedback"
          descricao={
            filtro === 'nao_lidos'
              ? 'Todos os feedbacks foram lidos!'
              : 'Quando alunos finalizarem treinos, seus feedbacks aparecerão aqui.'
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((fb) => (
              <motion.div
                key={fb.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`bg-[#141414] border rounded-2xl p-4 transition-colors ${
                  !fb.lido
                    ? 'border-[#00E620]/20 bg-[#00E620]/5'
                    : 'border-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#00E620]/10 flex items-center justify-center
                                  text-[#00E620] text-sm font-bold shrink-0">
                    {fb.alunoNome.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm">
                        {fb.alunoNome}
                      </span>
                      <span className="text-xl">{emojis[fb.sensacao]}</span>
                      <span className="text-xs text-gray-500">
                        {sensacaoLabels[fb.sensacao]}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-white/5 text-gray-400 rounded">
                        {tipoLabels[fb.tipo]}
                      </span>
                      {!fb.lido && (
                        <span className="w-2 h-2 rounded-full bg-[#00E620]" />
                      )}
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < fb.sensacao ? 'fill' : 'regular'}
                          className={
                            i < fb.sensacao
                              ? 'text-yellow-400'
                              : 'text-gray-700'
                          }
                        />
                      ))}
                    </div>

                    {fb.mensagem && (
                      <p
                        className={`mt-2 text-sm text-gray-300 ${
                          expandido !== fb.id ? 'line-clamp-2' : ''
                        }`}
                      >
                        "{fb.mensagem}"
                      </p>
                    )}

                    <p className="text-[10px] text-gray-600 mt-2">
                      {new Date(fb.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {fb.mensagem && fb.mensagem.length > 80 && (
                      <button
                        onClick={() =>
                          setExpandido(expandido === fb.id ? null : fb.id)
                        }
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                        title="Expandir"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    {!fb.lido && (
                      <button
                        onClick={() => marcarLido(fb.id)}
                        className="p-1.5 rounded-lg text-[#00E620] hover:bg-[#00E620]/10 transition-colors"
                        title="Marcar como lido"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteFeedback(fb.id)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
