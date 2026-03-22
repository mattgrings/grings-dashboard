import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ChatText,
  Barbell,
  Key,
  UserPlus,
  CalendarX,
  Check,
} from '@phosphor-icons/react'
import { useNotificacoesStore } from '../../store/notificacoesStore'
import type { Notificacao } from '../../store/notificacoesStore'

const tipoConfig: Record<
  Notificacao['tipo'],
  { icon: typeof Bell; color: string }
> = {
  feedback: { icon: ChatText, color: 'text-blue-400' },
  treino_concluido: { icon: Barbell, color: 'text-[#00E620]' },
  reset_senha: { icon: Key, color: 'text-yellow-400' },
  novo_aluno: { icon: UserPlus, color: 'text-purple-400' },
  vencimento: { icon: CalendarX, color: 'text-red-400' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export default function NotificacoesSino() {
  const notificacoes = useNotificacoesStore((s) => s.notificacoes)
  const marcarLida = useNotificacoesStore((s) => s.marcarLida)
  const marcarTodasLidas = useNotificacoesStore((s) => s.marcarTodasLidas)
  const naoLidas = useNotificacoesStore((s) => s.getNaoLidas())
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    if (aberto) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [aberto])

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setAberto(!aberto)}
        className="relative p-2.5 rounded-xl bg-[#141414] border border-white/5
                   text-gray-400 hover:text-white hover:border-white/10
                   transition-colors touch-manipulation"
      >
        <Bell
          size={18}
          weight={naoLidas > 0 ? 'fill' : 'regular'}
          className={naoLidas > 0 ? 'text-[#00E620]' : ''}
        />
        {naoLidas > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px]
                       bg-red-500 rounded-full flex items-center justify-center
                       text-white text-[10px] font-bold px-1
                       shadow-[0_0_8px_rgba(239,68,68,0.6)]"
          >
            {naoLidas > 9 ? '9+' : naoLidas}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 bg-[#1A1A1A] border border-white/10
                       rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="font-bold text-white text-sm">Notificações</h3>
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="text-xs text-[#00E620] hover:brightness-125 transition-all"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {notificacoes.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  Nenhuma notificação ainda
                </div>
              ) : (
                notificacoes.slice(0, 15).map((n) => {
                  const config = tipoConfig[n.tipo]
                  const Icon = config.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        marcarLida(n.id)
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left
                                  hover:bg-white/5 transition-colors ${
                                    !n.lida ? 'bg-[#00E620]/5' : ''
                                  }`}
                    >
                      <div
                        className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center
                                    shrink-0 ${config.color} bg-white/5`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {n.titulo}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {n.mensagem}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {timeAgo(n.criadoEm)}
                        </p>
                      </div>
                      {!n.lida && (
                        <div className="w-2 h-2 rounded-full bg-[#00E620] mt-2 shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {notificacoes.length > 0 && (
              <div className="px-4 py-2.5 border-t border-white/5">
                <button className="w-full text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                  <Check size={14} />
                  {notificacoes.length} notificações
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
